import React, { useState } from 'react';

const MechanicQuoteForm = ({ request, onSubmit, onCancel }) => {
  const [quoteData, setQuoteData] = useState({
    laborCost: '',
    partsCost: '',
    estimatedTime: '',
    notes: '',
    submittedBy: 'Auto Repair Center'
  });

  const [partsList, setPartsList] = useState([
    { id: 1, name: '', quantity: 1, price: '' }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const partsCost = partsList.reduce((sum, part) => sum + (part.price * part.quantity), 0);
    const totalCost = parseFloat(quoteData.laborCost || 0) + partsCost;
    
    onSubmit({
      ...quoteData,
      laborCost: parseFloat(quoteData.laborCost),
      partsCost,
      totalCost,
      partsList,
      submittedAt: new Date().toISOString()
    });
  };

  const addPart = () => {
    setPartsList([...partsList, { id: Date.now(), name: '', quantity: 1, price: '' }]);
  };

  const removePart = (id) => {
    setPartsList(partsList.filter(part => part.id !== id));
  };

  const updatePart = (id, field, value) => {
    setPartsList(partsList.map(part => 
      part.id === id ? { ...part, [field]: value } : part
    ));
  };

  return (
    <div className="quote-form-container">
      <div className="quote-form-header">
        <button className="back-btn" onClick={onCancel}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <h2>Prepare Quote for Request #{request.id}</h2>
      </div>
      
      <div className="quote-form-body">
        <div className="request-summary">
          <div className="summary-card">
            <div className="vehicle-info">
              <div className="vehicle-icon">
                <i className="bi bi-truck"></i>
              </div>
              <div>
                <h4>{request.vehicleId}</h4>
                <p>{request.mileage}</p>
              </div>
            </div>
            
            <div className="urgency-badge">
              <i className="bi bi-exclamation-triangle"></i>
              {request.urgency}
            </div>
          </div>
          
          <div className="issue-card">
            <h5>Reported Issue</h5>
            <p>{request.issueDescription}</p>
            <div className="issue-meta">
              <span><i className="bi bi-building"></i> {request.department}</span>
              <span><i className="bi bi-person"></i> {request.submittedBy}</span>
              <span><i className="bi bi-calendar"></i> {new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="quote-details-form">
          <div className="form-section">
            <h4><i className="bi bi-clock"></i> Time & Labor</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Estimated Repair Time</label>
                <select
                  value={quoteData.estimatedTime}
                  onChange={(e) => setQuoteData({...quoteData, estimatedTime: e.target.value})}
                  required
                >
                  <option value="">Select time estimate</option>
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="3 hours">3 hours</option>
                  <option value="4 hours">4 hours</option>
                  <option value="1 day">1 day</option>
                  <option value="2 days">2 days</option>
                  <option value="3+ days">3+ days</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Labor Cost ($)</label>
                <div className="input-with-icon">
                  <i className="bi bi-currency-dollar"></i>
                  <input
                    type="number"
                    value={quoteData.laborCost}
                    onChange={(e) => setQuoteData({...quoteData, laborCost: e.target.value})}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-header">
              <h4><i className="bi bi-gear"></i> Parts Needed</h4>
              <button type="button" className="add-part-btn" onClick={addPart}>
                <i className="bi bi-plus"></i> Add Part
              </button>
            </div>
            
            {partsList.map((part, index) => (
              <div key={part.id} className="part-row">
                <div className="part-input">
                  <label>Part Name</label>
                  <input
                    type="text"
                    value={part.name}
                    onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="part-input">
                  <label>Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={part.quantity}
                    onChange={(e) => updatePart(part.id, 'quantity', parseInt(e.target.value))}
                    required
                  />
                </div>
                
                <div className="part-input">
                  <label>Price Each</label>
                  <div className="input-with-icon">
                    <i className="bi bi-currency-dollar"></i>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={part.price}
                      onChange={(e) => updatePart(part.id, 'price', parseFloat(e.target.value))}
                      required
                    />
                  </div>
                </div>
                
                <div className="part-input">
                  <label>Total</label>
                  <div className="part-total">
                    ${(part.quantity * (part.price || 0)).toFixed(2)}
                  </div>
                </div>
                
                {partsList.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-part-btn"
                    onClick={() => removePart(part.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="form-section">
            <h4><i className="bi bi-card-text"></i> Repair Plan</h4>
            <div className="form-group">
              <label>Detailed Notes</label>
              <textarea
                rows="5"
                value={quoteData.notes}
                onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})}
                placeholder="Describe the repair process, required parts, and any special notes..."
                required
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              <i className="bi bi-send"></i> Submit Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MechanicQuoteForm;