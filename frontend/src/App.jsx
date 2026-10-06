import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3001/api/quotes";

function App() {
    const [form, setForm] = useState({
        customer_name: "",
        cover_type: "Single",
        applicant1_age: "",
        applicant1_cover_history: "Yes",
        applicant2_age: "",
        applicant2_cover_history: "Yes",
        hospital_cover: "None",
        extras_cover: "None",
        payment_frequency: "Monthly",
        annual_discount: "0",
        notes: ""
    });

    const [quotes, setQuotes] = useState([]);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [editingId, setEditingId] = useState(null);

    async function loadQuotes() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setQuotes(data);
        } catch (error) {
            setErrors(["Could not load saved quotes."]);
        }
    }

    useEffect(() => {
        loadQuotes();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        });
    }

    function validateForm() {
        const newErrors = [];

        if (!form.customer_name.trim()) {
            newErrors.push("Customer name is required.");
        }

        const applicant1Age = Number(form.applicant1_age);

        if (
            !form.applicant1_age ||
            applicant1Age < 18 ||
            applicant1Age > 100
        ) {
            newErrors.push("Applicant 1 age must be between 18 and 100.");
        }

        if (form.cover_type === "Couple" || form.cover_type === "Family") {
            const applicant2Age = Number(form.applicant2_age);

            if (
                !form.applicant2_age ||
                applicant2Age < 18 ||
                applicant2Age > 100
            ) {
                newErrors.push("Applicant 2 age must be between 18 and 100.");
            }
        }

        const discount = Number(form.annual_discount);

        if (discount < 0 || discount > 10) {
            newErrors.push("Annual discount must be between 0% and 10%.");
        }

        return newErrors;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setErrors([]);
        setMessage("");

        const validationErrors = validateForm();

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        const quoteData = {
            customer_name: form.customer_name,
            cover_type: form.cover_type,
            applicant1_age: Number(form.applicant1_age),
            applicant1_cover_history: form.applicant1_cover_history,
            applicant2_age:
                form.cover_type === "Single"
                    ? null
                    : Number(form.applicant2_age),
            applicant2_cover_history:
                form.cover_type === "Single"
                    ? null
                    : form.applicant2_cover_history,
            hospital_cover: form.hospital_cover,
            extras_cover: form.extras_cover,
            payment_frequency: form.payment_frequency,
            annual_discount: Number(form.annual_discount) / 100,
            notes: form.notes
        };

        try {
           const response = await fetch(
    editingId ? `${API_URL}/${editingId}` : API_URL,
    {
        method: editingId ? "PUT" : "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(quoteData)
    }
);

            const data = await response.json();

            if (!response.ok) {
                setErrors(
                    data.errors || [
                        data.error || "Something went wrong."
                    ]
                );
                return;
            }

            setMessage(
    editingId
        ? "Quote updated successfully!"
        : `Quote created successfully! Quote ID: ${data.id}`
                    );

            setForm({
                customer_name: "",
                cover_type: "Single",
                applicant1_age: "",
                applicant1_cover_history: "Yes",
                applicant2_age: "",
                applicant2_cover_history: "Yes",
                hospital_cover: "None",
                extras_cover: "None",
                payment_frequency: "Monthly",
                annual_discount: "0",
                notes: ""
            });
            
            setEditingId(null);
            loadQuotes();

        } catch (error) {
            setErrors(["Could not connect to the backend server."]);
        }
    }

    async function viewQuote(id) {
     try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();

        if (!response.ok) {
            setErrors([data.error || "Could not load quote."]);
            return;
        }

        setSelectedQuote(data);
    } catch (error) {
        setErrors(["Could not connect to the backend server."]);
    }
}
function cancelEdit() {
    setEditingId(null);

    setForm({
        customer_name: "",
        cover_type: "Single",
        applicant1_age: "",
        applicant1_cover_history: "Yes",
        applicant2_age: "",
        applicant2_cover_history: "Yes",
        hospital_cover: "None",
        extras_cover: "None",
        payment_frequency: "Monthly",
        annual_discount: "0",
        notes: ""
    });

    setErrors([]);
    setMessage("");
}
function editQuote(quote) {
    setEditingId(quote.id);

    setForm({
        customer_name: quote.customer_name,
        cover_type: quote.cover_type,
        applicant1_age: String(quote.applicant1_age),
        applicant1_cover_history: quote.applicant1_cover_history,
        applicant2_age:
            quote.applicant2_age === null
                ? ""
                : String(quote.applicant2_age),
        applicant2_cover_history:
            quote.applicant2_cover_history || "Yes",
        hospital_cover: quote.hospital_cover,
        extras_cover: quote.extras_cover,
        payment_frequency: quote.payment_frequency,
        annual_discount: String(quote.annual_discount * 100),
        notes: quote.notes || ""
    });
    
function cancelEdit() {
    setEditingId(null);

    setForm({
        customer_name: "",
        cover_type: "Single",
        applicant1_age: "",
        applicant1_cover_history: "Yes",
        applicant2_age: "",
        applicant2_cover_history: "Yes",
        hospital_cover: "None",
        extras_cover: "None",
        payment_frequency: "Monthly",
        annual_discount: "0",
        notes: ""
    });

    setErrors([]);
    setMessage("");
}

    setSelectedQuote(null);
    setMessage("");
    setErrors([]);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
    async function deleteQuote(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this quote?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors([data.error || "Could not delete quote."]);
                return;
            }

            setMessage("Quote deleted successfully.");
            loadQuotes();
        } catch (error) {
            setErrors(["Could not connect to the backend server."]);
        }
    }

    return (
        <div className="app">
            <h1>HealthCoverSim</h1>
            <p>Private Health Insurance Quote Simulator</p>

            <div className="form-card">
                <h2>Create Quote</h2>

                {errors.length > 0 && (
                    <div className="error-box">
                        <strong>Please fix the following:</strong>

                        <ul>
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {message && (
                    <div className="success-box">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label>Customer Name</label>

                    <input
                        type="text"
                        name="customer_name"
                        value={form.customer_name}
                        onChange={handleChange}
                        placeholder="Enter customer name"
                    />

                    <label>Cover Type</label>

                    <select
                        name="cover_type"
                        value={form.cover_type}
                        onChange={handleChange}
                    >
                        <option value="Single">Single</option>
                        <option value="Couple">Couple</option>
                        <option value="Family">Family</option>
                    </select>

                    <h3>Applicant 1</h3>

                    <label>Age</label>

                    <input
                        type="number"
                        name="applicant1_age"
                        min="18"
                        max="100"
                        value={form.applicant1_age}
                        onChange={handleChange}
                    />

                    <label>Hospital Cover History</label>

                    <select
                        name="applicant1_cover_history"
                        value={form.applicant1_cover_history}
                        onChange={handleChange}
                    >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Not sure">Not sure</option>
                    </select>

                    {form.applicant1_cover_history === "Not sure" && (
    <p className="warning">
        Warning: Applicant 1 is not sure about their hospital cover history.
    </p>
)}

                    {(form.cover_type === "Couple" ||
                        form.cover_type === "Family") && (
                        <>
                            <h3>Applicant 2</h3>

                            <label>Age</label>

                            <input
                                type="number"
                                name="applicant2_age"
                                min="18"
                                max="100"
                                value={form.applicant2_age}
                                onChange={handleChange}
                            />

                            <label>Hospital Cover History</label>

                            <select
                                name="applicant2_cover_history"
                                value={form.applicant2_cover_history}
                                onChange={handleChange}
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Not sure">
                                    Not sure
                                </option>
                            </select>

                            {form.applicant2_cover_history === "Not sure" && (
    <p className="warning">
        Warning: Applicant 2 is not sure about their hospital cover history.
    </p>
)}
                        </>
                    )}

                    <label>Hospital Cover</label>

                    <select
                        name="hospital_cover"
                        value={form.hospital_cover}
                        onChange={handleChange}
                    >
                        <option value="None">None</option>
                        <option value="Basic">Basic</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                    </select>

                    <label>Extras Cover</label>

                    <select
                        name="extras_cover"
                        value={form.extras_cover}
                        onChange={handleChange}
                    >
                        <option value="None">None</option>
                        <option value="Basic">Basic</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                    </select>

                    <label>Payment Frequency</label>

                    <select
                        name="payment_frequency"
                        value={form.payment_frequency}
                        onChange={handleChange}
                    >
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                    </select>

                    <label>Annual Discount (%)</label>

                    <input
                        type="number"
                        name="annual_discount"
                        min="0"
                        max="10"
                        step="0.1"
                        value={form.annual_discount}
                        onChange={handleChange}
                    />

                    <label>Notes</label>

                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Optional notes"
                        rows="4"
                    />

                  <button type="submit">
    {editingId ? "Update Quote" : "Create Quote"}
</button>

{editingId && (
    <button
        type="button"
        onClick={cancelEdit}
    >
        Cancel Edit
    </button>
)}
                </form>
            </div>

            <div className="form-card">
                <div className="quotes-header">
                    <h2>Saved Quotes</h2>

                    <button type="button" onClick={loadQuotes}>
                        Refresh Quotes
                    </button>
                </div>

                {quotes.length === 0 ? (
                    <p>No saved quotes yet.</p>
                ) : (
                    <div className="quotes-list">
                        {quotes.map((quote) => (
                            <div className="quote-item" key={quote.id}>
                                <div>
                                    <strong>
                                        #{quote.id} - {quote.customer_name}
                                    </strong>

                                    <p>
                                        {quote.cover_type} |{" "}
                                        {quote.hospital_cover} Hospital |{" "}
                                        {quote.extras_cover} Extras |{" "}
                                        {quote.payment_frequency}
                                    </p>
                                </div>

                                
  <div>
    <button
        type="button"
        onClick={() => viewQuote(quote.id)}
    >
        View
    </button>

    <button
        type="button"
        onClick={() => editQuote(quote)}
    >
        Edit
    </button>

    <button
        type="button"
        onClick={() => deleteQuote(quote.id)}
    >
        Delete
    </button>
</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {selectedQuote && (
    <div className="form-card">
        <h2>Quote #{selectedQuote.id} Details</h2>

        <p>
            <strong>Customer:</strong>{" "}
            {selectedQuote.customer_name}
        </p>

        <p>
            <strong>Cover Type:</strong>{" "}
            {selectedQuote.cover_type}
        </p>

        <h3>Applicant 1</h3>

        <p>
            Age: {selectedQuote.applicant1_age}
        </p>

        <p>
            Hospital Cover History:{" "}
            {selectedQuote.applicant1_cover_history}
        </p>

        <p>
            LHC Loading:{" "}
            {(selectedQuote.calculation.applicant1Loading * 100).toFixed(0)}%
        </p>

        {selectedQuote.cover_type !== "Single" && (
            <>
                <h3>Applicant 2</h3>

                <p>
                    Age: {selectedQuote.applicant2_age}
                </p>

                <p>
                    Hospital Cover History:{" "}
                    {selectedQuote.applicant2_cover_history}
                </p>

                <p>
                    LHC Loading:{" "}
                    {(selectedQuote.calculation.applicant2Loading * 100).toFixed(0)}%
                </p>
            </>
        )}

        <h3>Premium Breakdown</h3>

        <p>
            Hospital Total: $
            {selectedQuote.calculation.hospitalTotal.toFixed(2)}
        </p>

        <p>
            Extras Total: $
            {selectedQuote.calculation.extrasTotal.toFixed(2)}
        </p>

        <p>
            Family Fee: $
            {selectedQuote.calculation.familyFee.toFixed(2)}
        </p>

        <p>
            <strong>
                Monthly Premium: $
                {selectedQuote.calculation.monthlyPremium.toFixed(2)}
            </strong>
        </p>

        <p>
            Yearly Before Discount: $
            {selectedQuote.calculation.yearlyBeforeDiscount.toFixed(2)}
        </p>

        {selectedQuote.payment_frequency === "Yearly" && (
            <p>
                <strong>
                    Yearly After Discount: $
                    {selectedQuote.calculation.yearlyAfterDiscount.toFixed(2)}
                </strong>
            </p>
        )}

        <h3>LHC Explanation</h3>

        <p>
            Lifetime Health Cover loading applies only to hospital cover.
            It does not apply to extras cover.
        </p>

        {selectedQuote.applicant1_cover_history === "Not sure" && (
            <p>
                Warning: Applicant 1 is not sure about their hospital cover history.
            </p>
        )}

        {selectedQuote.applicant2_cover_history === "Not sure" && (
            <p>
                Warning: Applicant 2 is not sure about their hospital cover history.
            </p>
        )}

        <button
            type="button"
            onClick={() => setSelectedQuote(null)}
        >
            Close Details
        </button>
    </div>
)}
        </div>
     );
   }

export default App;