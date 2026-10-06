const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/* =========================
   PRICING
========================= */

const hospitalPrices = {
    None: 0,
    Basic: 90,
    Bronze: 120,
    Silver: 160,
    Gold: 220
};

const extrasPrices = {
    None: 0,
    Basic: 25,
    Standard: 45,
    Premium: 70
};

/* =========================
   CALCULATION FUNCTIONS
========================= */

function calculateLHC(age, history, hospitalCover) {
    // No hospital cover = no LHC loading
    if (hospitalCover === "None") {
        return 0;
    }

    // Previous hospital cover = no loading
    if (history === "Yes") {
        return 0;
    }

    // Unknown history = do not apply loading
    if (history === "Not sure") {
        return 0;
    }

    // No previous cover
    if (history === "No" && age > 30) {
        return (age - 30) * 0.02;
    }

    return 0;
}

function calculateQuote(quote) {
    const adultCount =
        quote.cover_type === "Single" ? 1 : 2;

    const hospitalPrice =
        hospitalPrices[quote.hospital_cover];

    const extrasPrice =
        extrasPrices[quote.extras_cover];

    // Applicant 1
    const applicant1Loading = calculateLHC(
        quote.applicant1_age,
        quote.applicant1_cover_history,
        quote.hospital_cover
    );

    const applicant1Hospital =
        hospitalPrice * (1 + applicant1Loading);

    // Applicant 2
    let applicant2Loading = 0;
    let applicant2Hospital = 0;

    if (adultCount === 2) {
        applicant2Loading = calculateLHC(
            quote.applicant2_age,
            quote.applicant2_cover_history,
            quote.hospital_cover
        );

        applicant2Hospital =
            hospitalPrice * (1 + applicant2Loading);
    }

    const hospitalTotal =
        applicant1Hospital + applicant2Hospital;

    const extrasTotal =
        extrasPrice * adultCount;

    const familyFee =
        quote.cover_type === "Family" ? 30 : 0;

    const monthlyPremium =
        hospitalTotal +
        extrasTotal +
        familyFee;

    const yearlyBeforeDiscount =
        monthlyPremium * 12;

    const discount =
        quote.payment_frequency === "Yearly"
            ? quote.annual_discount
            : 0;

    const yearlyAfterDiscount =
        yearlyBeforeDiscount * (1 - discount);

    return {
        applicant1Loading,
        applicant2Loading,
        hospitalTotal,
        extrasTotal,
        familyFee,
        monthlyPremium,
        yearlyBeforeDiscount,
        yearlyAfterDiscount,
        discount
    };
}

/* =========================
   VALIDATION
========================= */

function validateQuote(data) {
    const errors = [];

    if (!data.customer_name?.trim()) {
        errors.push("Customer name is required.");
    }

    const validCoverTypes = ["Single", "Couple", "Family"];

    if (!validCoverTypes.includes(data.cover_type)) {
        errors.push("Invalid cover type.");
    }

    const validHospital = [
        "None",
        "Basic",
        "Bronze",
        "Silver",
        "Gold"
    ];

    if (!validHospital.includes(data.hospital_cover)) {
        errors.push("Invalid hospital cover.");
    }

    const validExtras = [
        "None",
        "Basic",
        "Standard",
        "Premium"
    ];

    if (!validExtras.includes(data.extras_cover)) {
        errors.push("Invalid extras cover.");
    }

    const validPayment = ["Monthly", "Yearly"];

    if (!validPayment.includes(data.payment_frequency)) {
        errors.push("Invalid payment frequency.");
    }

    // Applicant 1
    if (
        !Number.isInteger(data.applicant1_age) ||
        data.applicant1_age < 18 ||
        data.applicant1_age > 100
    ) {
        errors.push("Applicant 1 age must be between 18 and 100.");
    }

    const validHistory = ["Yes", "No", "Not sure"];

    if (!validHistory.includes(data.applicant1_cover_history)) {
        errors.push("Invalid Applicant 1 cover history.");
    }

    // Applicant 2
    if (
        data.cover_type === "Couple" ||
        data.cover_type === "Family"
    ) {
        if (
            !Number.isInteger(data.applicant2_age) ||
            data.applicant2_age < 18 ||
            data.applicant2_age > 100
        ) {
            errors.push(
                "Applicant 2 age must be between 18 and 100."
            );
        }

        if (!validHistory.includes(data.applicant2_cover_history)) {
            errors.push("Invalid Applicant 2 cover history.");
        }
    }

    // Discount
    if (
        typeof data.annual_discount !== "number" ||
        data.annual_discount < 0 ||
        data.annual_discount > 0.10
    ) {
        errors.push("Annual discount must be between 0% and 10%.");
    }

    return errors;
}

/* =========================
   GET ALL QUOTES
========================= */

app.get("/api/quotes", (req, res) => {
    const quotes = db
        .prepare("SELECT * FROM quotes ORDER BY id DESC")
        .all();

    res.json(quotes);
});

/* =========================
   GET ONE QUOTE
========================= */

app.get("/api/quotes/:id", (req, res) => {
    const quote = db
        .prepare("SELECT * FROM quotes WHERE id = ?")
        .get(req.params.id);

    if (!quote) {
        return res.status(404).json({
            error: "Quote not found."
        });
    }

    res.json({
        ...quote,
        calculation: calculateQuote(quote)
    });
});

/* =========================
   CREATE QUOTE
========================= */

app.post("/api/quotes", (req, res) => {
    const data = req.body;

    const errors = validateQuote(data);

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const stmt = db.prepare(`
        INSERT INTO quotes (
            customer_name,
            cover_type,
            applicant1_age,
            applicant1_cover_history,
            applicant2_age,
            applicant2_cover_history,
            hospital_cover,
            extras_cover,
            payment_frequency,
            annual_discount,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        data.customer_name.trim(),
        data.cover_type,
        data.applicant1_age,
        data.applicant1_cover_history,
        data.cover_type === "Single"
            ? null
            : data.applicant2_age,
        data.cover_type === "Single"
            ? null
            : data.applicant2_cover_history,
        data.hospital_cover,
        data.extras_cover,
        data.payment_frequency,
        data.annual_discount,
        data.notes || null
    );

    res.status(201).json({
        id: result.lastInsertRowid,
        message: "Quote created successfully."
    });
});

/* =========================
   UPDATE QUOTE
========================= */

app.put("/api/quotes/:id", (req, res) => {
    const data = req.body;

    const errors = validateQuote(data);

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const existing = db
        .prepare("SELECT * FROM quotes WHERE id = ?")
        .get(req.params.id);

    if (!existing) {
        return res.status(404).json({
            error: "Quote not found."
        });
    }

    db.prepare(`
        UPDATE quotes
        SET
            customer_name = ?,
            cover_type = ?,
            applicant1_age = ?,
            applicant1_cover_history = ?,
            applicant2_age = ?,
            applicant2_cover_history = ?,
            hospital_cover = ?,
            extras_cover = ?,
            payment_frequency = ?,
            annual_discount = ?,
            notes = ?
        WHERE id = ?
    `).run(
        data.customer_name.trim(),
        data.cover_type,
        data.applicant1_age,
        data.applicant1_cover_history,
        data.cover_type === "Single"
            ? null
            : data.applicant2_age,
        data.cover_type === "Single"
            ? null
            : data.applicant2_cover_history,
        data.hospital_cover,
        data.extras_cover,
        data.payment_frequency,
        data.annual_discount,
        data.notes || null,
        req.params.id
    );

    res.json({
        message: "Quote updated successfully."
    });
});

/* =========================
   DELETE QUOTE
========================= */

app.delete("/api/quotes/:id", (req, res) => {
    const result = db
        .prepare("DELETE FROM quotes WHERE id = ?")
        .run(req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Quote not found."
        });
    }

    res.json({
        message: "Quote deleted successfully."
    });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});