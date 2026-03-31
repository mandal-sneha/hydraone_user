import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { axiosInstance } from '../../lib/axios';
import { FiCreditCard, FiLoader, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const CardForm = ({ amount, month, waterId, onSuccess, onClose, colors, darkMode }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            setError('Payment system not ready');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login again');
                window.location.href = '/login';
                return;
            }

            const { data } = await axiosInstance.post('/payment/create-payment-intent', {
                waterId,
                month,
                amount
            });

            if (!data.success) {
                setError(data.error || 'Failed to create payment');
                setProcessing(false);
                return;
            }

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)
                }
            });

            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                const confirmRes = await axiosInstance.post('/payment/confirm-payment', {
                    paymentIntentId: paymentIntent.id,
                    amount: amount,
                    waterId,
                    month
                });

                if (confirmRes.data.success) {
                    onSuccess(paymentIntent.id);
                } else {
                    setError(confirmRes.data.error || 'Payment recorded failed');
                }
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError(err.response?.data?.error || 'Payment failed');
            }
        } finally {
            setProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                color: colors.textColor,
                fontSize: '16px',
                fontFamily: 'Inter, system-ui, sans-serif',
                '::placeholder': { color: colors.mutedText }
            },
            invalid: { color: '#ef4444' }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border rounded-xl" style={{ borderColor: colors.borderColor, backgroundColor: colors.baseColor }}>
                <CardElement options={cardElementOptions} />
            </div>
            {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6e8efb, #a777e3)' }}
            >
                {processing ? <FiLoader className="animate-spin" /> : <FiCreditCard />}
                {processing ? 'Processing...' : `Pay ₹${amount}`}
            </button>
        </form>
    );
};

const PaymentModal = ({ isOpen, onClose, amount, month, waterId, colors, darkMode }) => {
    const [stripeError, setStripeError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [paymentId, setPaymentId] = useState('');

    if (!isOpen) return null;

    const handleRetry = () => {
        setStripeError(false);
        window.location.reload();
    };

    const handlePaymentSuccess = (paymentIntentId) => {
        setPaymentId(paymentIntentId);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
            window.location.reload();
        }, 5000);
    };

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="rounded-2xl w-full max-w-md overflow-hidden" style={{ backgroundColor: colors.cardBg }} onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                            <FiCheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textColor }}>Payment Successful!</h2>
                        <p className="text-sm mb-4" style={{ color: colors.mutedText }}>
                            Your payment of ₹{amount} for {month} has been processed successfully.
                        </p>
                        <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: colors.baseColor, border: `1px solid ${colors.borderColor}` }}>
                            <p className="text-xs font-medium mb-1" style={{ color: colors.mutedText }}>Transaction ID</p>
                            <p className="text-sm font-mono font-bold" style={{ color: colors.textColor }}>{paymentId}</p>
                        </div>
                        <p className="text-xs" style={{ color: colors.mutedText }}>
                            Redirecting to dashboard in a few seconds...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!stripePromise || stripePromise === undefined) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="rounded-2xl w-full max-w-md overflow-hidden" style={{ backgroundColor: colors.cardBg }} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderColor }}>
                        <h2 className="text-xl font-bold" style={{ color: colors.textColor }}>Payment Error</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <FiX className="w-5 h-5" style={{ color: colors.mutedText }} />
                        </button>
                    </div>
                    <div className="p-6 text-center">
                        <FiAlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <p className="text-lg font-semibold mb-2" style={{ color: colors.textColor }}>Stripe Not Configured</p>
                        <p className="text-sm mb-6" style={{ color: colors.mutedText }}>
                            Payment system is not properly configured. Please contact support.
                        </p>
                        <button
                            onClick={handleRetry}
                            className="w-full py-3 rounded-xl text-white font-bold"
                            style={{ background: 'linear-gradient(135deg, #6e8efb, #a777e3)' }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="rounded-2xl w-full max-w-md overflow-hidden" style={{ backgroundColor: colors.cardBg }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderColor }}>
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: colors.textColor }}>Pay Bill</h2>
                        <p className="text-sm mt-1" style={{ color: colors.mutedText }}>{month}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <FiX className="w-5 h-5" style={{ color: colors.mutedText }} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-4 text-center">
                        <p className="text-sm" style={{ color: colors.mutedText }}>Total Amount</p>
                        <p className="text-3xl font-bold" style={{ color: colors.textColor }}>₹{amount}</p>
                    </div>
                    <Elements stripe={stripePromise}>
                        <CardForm
                            amount={amount}
                            month={month}
                            waterId={waterId}
                            onSuccess={handlePaymentSuccess}
                            onClose={onClose}
                            colors={colors}
                            darkMode={darkMode}
                        />
                    </Elements>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;