import { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import ChatWidget from '../components/ChatWindow'; // The new chat widget

export default function DoctorDashboard() {
  // Hardcoded to "Doctor" to avoid Firebase Auth conflicts during the demo
  const [doctorName, setDoctorName] = useState("Doctor");
  const [bookings, setBookings] = useState([]);
  
  // SOS State
  const [activeAlert, setActiveAlert] = useState(false);
  const [sosPatientName, setSosPatientName] = useState('');

  // Input Form State
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTiming, setMedTiming] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // 1. LIVE BOOKINGS LISTENER
    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingData = [];
      snapshot.forEach((doc) => bookingData.push({ id: doc.id, ...doc.data() }));
      bookingData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setBookings(bookingData);
    });

    // 2. CROSS-TAB SOS BRIDGE
    const checkSOS = () => {
      const emergencyName = localStorage.getItem('activeSOS');
      if (emergencyName) {
        setSosPatientName(emergencyName);
        setActiveAlert(true);
      }
    };
    checkSOS(); // Check on load
    window.addEventListener('storage', checkSOS); // Listen for live changes

    return () => {
      unsubscribeBookings();
      window.removeEventListener('storage', checkSOS);
    };
  }, []);

  // Write new medicine to database
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!medName || !medDosage || !medTiming) return alert("Please fill all medicine fields.");
    
    try {
      await addDoc(collection(db, 'medicines'), {
        name: medName,
        dosage: medDosage,
        timing: medTiming,
        createdAt: serverTimestamp()
      });
      setMedName(''); setMedDosage(''); setMedTiming(''); // Clear form
    } catch (error) {
      console.error("Error adding medicine:", error);
    }
  };

  // Write mock file upload to database
  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file first.");

    try {
      await addDoc(collection(db, 'reports'), {
        title: selectedFile.name,
        date: new Date().toLocaleDateString(),
        status: "New Result",
        createdAt: serverTimestamp()
      });
      setSelectedFile(null);
      document.getElementById('file-upload').value = '';
    } catch (error) {
      console.error("Error uploading report:", error);
    }
  };

  const acknowledgeAlert = () => {
    localStorage.removeItem('activeSOS');
    setActiveAlert(false);
    setSosPatientName('');
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto relative">
      
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {doctorName}</h2>
          <p className="mt-1 text-slate-500 font-medium">Manage your patients and monitor active alerts.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">System Online</span>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        
        <div className="md:col-span-2 space-y-8">
          
          {/* PATIENT DATA ENTRY */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h3 className="mb-6 text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
              Update Patient File
            </h3>
            
            <div className="space-y-8">
              {/* Add Medicine Form */}
              <form onSubmit={handleAddMedicine}>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Prescribe New Medicine</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" value={medName} onChange={(e)=>setMedName(e.target.value)} placeholder="Medicine Name" className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  <input type="text" value={medDosage} onChange={(e)=>setMedDosage(e.target.value)} placeholder="Dosage (e.g. 500mg)" className="w-full sm:w-1/4 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  <input type="text" value={medTiming} onChange={(e)=>setMedTiming(e.target.value)} placeholder="Timing" className="w-full sm:w-1/4 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-700 shadow-md">Add</button>
                </div>
              </form>

              {/* Upload Report Form */}
              <form onSubmit={handleUploadReport} className="border-t border-slate-100 pt-6">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Upload Lab Report</label>
                <div className="flex gap-3 items-center">
                  <input 
                    id="file-upload"
                    type="file" 
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" 
                  />
                  <button type="submit" className="rounded-xl bg-slate-900 px-6 py-2.5 font-bold text-white hover:bg-slate-800 shadow-md whitespace-nowrap">
                    Upload File
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* LIVE BOOKINGS FEED */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-800">Live Home Visit Requests</h3>
              <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{bookings.length} Pending</span>
            </div>
            
            {bookings.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-slate-500 font-medium">No home visits booked yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center mb-4 sm:mb-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl mr-4 shadow-sm">🩺</div>
                      <div>
                        <h4 className="font-bold text-slate-800">{booking.serviceType}</h4>
                        <p className="text-sm font-medium text-slate-600 mt-0.5">Patient: <span className="text-slate-800 font-bold">{booking.patientName}</span></p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <span className="text-sm font-bold text-slate-800 mb-1">📅 {booking.date}</span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">⏰ {booking.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* EMERGENCY ALERTS */}
        <div className="h-full">
          <section className="rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full sticky top-8">
            <h3 className="mb-6 text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">Live SOS Alerts</h3>
            {activeAlert ? (
              <div className="relative overflow-hidden flex-1 rounded-xl bg-red-50 p-6 border border-red-100 flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full -mr-4 -mt-4 animate-pulse"></div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl">🚨</span>
                    <h4 className="text-lg font-extrabold text-red-700 tracking-tight">EMERGENCY</h4>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 mb-6">
                    <p className="text-sm font-bold text-slate-800 mb-1">Patient: <span className="text-red-700">{sosPatientName}</span></p>
                    <p className="text-xs font-medium text-red-600/80">Triggered: Just now</p>
                  </div>
                </div>
                <button onClick={acknowledgeAlert} className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white">Acknowledge Alert</button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed p-6">
                <span className="text-5xl mb-4 opacity-50">✅</span>
                <p className="font-medium text-sm text-center">No active emergencies.<br/>All patients are stable.</p>
              </div>
            )}
          </section>
        </div>

      </div>
      
      {/* THE LIVE CHAT WIDGET */}
      <ChatWidget role="doctor" userName={doctorName} />
    </div>
  );
}