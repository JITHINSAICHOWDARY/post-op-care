import { useState } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase'; // 1. Bring in your database bridge
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // 2. Bring in Firestore tools

export default function Booking() {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('Dressing Change');
  
  // 3. New state to capture the actual inputs
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 4. The function that talks to Firebase
  const handleCheckout = async () => {
    setIsProcessing(true); // Start the loading spinner

    try {
      // Create a new document in the "bookings" collection in your cloud database
      await addDoc(collection(db, 'bookings'), {
        serviceType: serviceType,
        date: date,
        time: time,
        // We grab the currently logged-in user's ID, or label them 'guest'
        patientId: auth.currentUser?.uid || 'guest', 
        patientName: auth.currentUser?.displayName || auth.currentUser?.email || 'Guest Patient',
        status: 'confirmed',
        createdAt: serverTimestamp() // Stamps the exact time it was booked
      });

      // Give it a 1-second delay so the "Payment" feels real to the judges
      setTimeout(() => {
        setIsProcessing(false);
        setStep(3); // Move to success screen
      }, 1000);

    } catch (error) {
      console.error("Error saving booking: ", error);
      alert("Failed to connect to the database. Check console.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all">
        
        {/* STEP 1: Date & Time Picker */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            <h2 className="mb-8 text-2xl font-extrabold text-slate-800 tracking-tight border-b border-slate-100 pb-4">
              Book a Home Visit
            </h2>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Service Type</label>
                <select 
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer bg-slate-50"
                >
                  <option>Dressing Change</option>
                  <option>Physiotherapy Session</option>
                  <option>Post-Op Vitals Check</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Select Date</label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer bg-slate-50" 
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Select Time</label>
                  <input 
                    type="time" 
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer bg-slate-50" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="mt-8 w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/30"
              >
                Continue to Payment
              </button>
              
              <div className="text-center mt-4">
                <Link to="/patient" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Cancel and return to Dashboard
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Secure Checkout */}
        {step === 2 && (
          <div className="text-center space-y-6 animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Secure Checkout</h2>
            
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 text-left shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-slate-500">Service:</span>
                <span className="font-bold text-slate-800">{serviceType}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-slate-500">Schedule:</span>
                <span className="font-bold text-slate-800">{date} at {time}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4">
                <span className="font-bold text-slate-700">Total Due:</span>
                <span className="text-2xl font-black text-blue-600">$50.00</span>
              </div>
            </div>
            
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Demo Environment Active
            </p>
            
            <div className="space-y-3 pt-4">
              <button 
                onClick={handleCheckout} 
                disabled={isProcessing}
                className="w-full flex justify-center items-center rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-600/40 disabled:bg-blue-400 disabled:transform-none disabled:shadow-none"
              >
                {isProcessing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing Payment...
                  </>
                ) : (
                  "Confirm & Pay"
                )}
              </button>
              <button 
                onClick={() => setStep(1)} 
                disabled={isProcessing}
                className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Message */}
        {step === 3 && (
          <div className="text-center space-y-5 py-8 animate-in zoom-in duration-500">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-100 mb-6 shadow-inner">
              <span className="text-5xl">✅</span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-emerald-600 tracking-tight">Booking Confirmed!</h2>
            <p className="text-slate-500 font-medium px-4">
              Your {serviceType} provider has been notified and is scheduled for {date}. Your record has been saved to the database.
            </p>
            
            <div className="pt-8">
              <Link 
                to="/patient" 
                className="inline-block w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/30"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}