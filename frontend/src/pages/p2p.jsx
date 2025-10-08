'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, DollarSign, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import { handleApiError, validateFormInput } from '../utils/errorHandler';

export default function P2PPage() {
  const { address, isConnected } = useAccount();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/p2p/orders?status=open');
      
      if (!res.ok) {
        const error = await handleApiError(res);
        showToast({ type: 'error', message: error.message });
        setErrorMsg(error.message);
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        showToast({ 
          type: 'success', 
          message: `Loaded ${data.data.length} P2P orders` 
        });
      }
    } catch (error) {
      const handledError = await handleApiError(error);
      console.error('Error fetching orders:', handledError);
      showToast({ type: 'error', message: handledError.message });
      setErrorMsg(handledError.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      showToast({ 
        type: 'error', 
        message: 'Please connect your wallet first' 
      });
      return;
    }

    const form = new FormData(e.target);
    const orderData = {
      maker: address,
      type: form.get('type'),
      price: parseFloat(form.get('price')),
      amount: parseFloat(form.get('amount')),
      minAmount: parseFloat(form.get('minAmount')) || 0,
      maxAmount: parseFloat(form.get('maxAmount')) || 0,
      paymentMethods: form.get('paymentMethods') ? form.get('paymentMethods').split(',').map(s => s.trim()) : []
    };

    // Validate order input
    const validation = validateFormInput(orderData, {
      type: { required: true },
      price: { required: true, min: 0.000001 },
      amount: { required: true, min: 0.000001 },
      paymentMethods: { required: true }
    });

    if (!validation.isValid) {
      showToast({
        type: 'error',
        message: Object.values(validation.errors)[0]
      });
      return;
    }

    try {
      const res = await fetch('/api/p2p/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        fetchOrders();
      } else {
        alert(data.message || 'Failed to create order');
      }
    } catch (e) {
      alert('Failed to create order');
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/p2p/orders/${orderId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) fetchOrders();
    } catch {}
  };

  return (
    <>
      <Head>
        <title>P2P AEG - Aegora</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">P2P AEG Orders</h1>
            <button onClick={() => setShowCreate(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-5 h-5" />
              <span>New Order</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">{errorMsg}</div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">Open orders: {orders.length}</div>
            <button onClick={fetchOrders} disabled={loading} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-600">Loading...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orders.map((o) => (
                <div key={o.orderId} className="bg-white rounded-lg border p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">Order #{o.orderId}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{o.type.toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">Maker: {o.maker?.slice(0,6)}...{o.maker?.slice(-4)}</div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-gray-500" /><span>Price</span></div>
                    <div className="font-semibold">{o.price}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span>Amount</span>
                    <span className="font-semibold">{o.remainingAmount}/{o.amount} AEG</span>
                  </div>
                  {o.paymentMethods?.length > 0 && (
                    <div className="text-xs text-gray-500 mt-2">Methods: {o.paymentMethods.join(', ')}</div>
                  )}
                  {address && o.maker?.toLowerCase() === address.toLowerCase() && o.status === 'open' && (
                    <button onClick={() => cancelOrder(o.orderId)} className="mt-3 text-sm text-red-600 hover:text-red-700">Cancel</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">Create P2P Order</div>
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={createOrder} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Type</label>
                  <select name="type" className="w-full border rounded px-3 py-2" required>
                    <option value="buy">Buy AEG</option>
                    <option value="sell">Sell AEG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Price (per AEG)</label>
                  <input name="price" type="number" step="0.0001" className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Amount (AEG)</label>
                  <input name="amount" type="number" step="0.0001" className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Min Amount</label>
                    <input name="minAmount" type="number" step="0.0001" className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Max Amount</label>
                    <input name="maxAmount" type="number" step="0.0001" className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Payment Methods (comma-separated)</label>
                  <input name="paymentMethods" type="text" placeholder="Bank, USDT, PayPal" className="w-full border rounded px-3 py-2" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


