import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InquiryService from '../../services/InquiryService';
import { Inquiry } from '../../types/types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const data = await InquiryService.getUserInquiries();
        setInquiries(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch inquiries:', err);
        setError('Failed to load your inquiries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/inquiry" className="btn btn-primary">
          New Inquiry
        </Link>
      </div>

      <div className="dashboard-welcome">
        <h2>Welcome, {user?.username}!</h2>
        <p>
          View your past inquiries below or create a new inquiry to calculate costs for your order.
        </p>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h3>Your Recent Inquiries</h3>
          
          {loading && <div className="loading">Loading your inquiries...</div>}
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          {!loading && !error && inquiries.length === 0 && (
            <div className="no-inquiries">
              <p>You haven't created any inquiries yet.</p>
              <Link to="/inquiry" className="btn btn-primary">Create Your First Inquiry</Link>
            </div>
          )}
          
          {!loading && !error && inquiries.length > 0 && (
            <div className="inquiry-list">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Trim Type</th>
                    <th>RM Spec</th>
                    <th>Total Charges</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id}>
                      <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                      <td>{inquiry.product}</td>
                      <td>{inquiry.trimType}</td>
                      <td>{inquiry.rmSpec}</td>
                      <td>${inquiry.totalCharges.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;