import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import ChatWidget from '../components/ChatWindow'; // The new chat widget

export default function PatientDashboard() {
  const [patientName, setPatientName] = useState("Loading...");
  
  // Real-time State for Medicines and Reports
  const [medicines, setMedicines] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const dynamicName = user.displayName || user.email.split('@')[0];
        setPatientName(dynamicName.charAt(0).toUpperCase() + dynamicName.slice(1));
      } else {
        setPatientName("Guest Patient");
      }
    });

    // Real-time Medicine Listener
    const unsubscribeMeds = onSnapshot(collection(db, 'medicines'), (snapshot) => {
      const medData = [];
      snapshot.forEach((doc) => medData.push({ id: doc.id, ...doc.data() }));
      medData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setMedicines(medData);
    });

    // Real-time Reports Listener
    const unsubscribeReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const reportData = [];
      snapshot.forEach((doc) => reportData.push({ id: doc.id, ...doc.data() }));
      reportData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setReports(reportData);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMeds();
      unsubscribeReports();
    };
  }, []);

  const handleSOSClick = () => {
    localStorage.setItem('activeSOS', patientName);
    localStorage.setItem('sosTimestamp', Date.now()); 
    alert("🚨 Emergency SOS transmitted directly to your Doctor's dashboard!");
  };

  const dietRestrictions = ["Low-Sodium", "Diabetic-Friendly"];

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto relative">
      
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 tracking-widest uppercase border border-emerald-100">
            Recovery Phase 2
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {patientName}</h2>
          <p className="mt-1 text-slate-500 font-medium">Your healing is on track today.</p>
        </div>
        
        <button onClick={handleSOSClick} className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-6 py-3 text-sm font-bold text-red-700 transition-all hover:bg-red-100 hover:shadow-md border border-red-100">
          <span className="text-lg">🚨</span> SOS Emergency
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        
        <div className="lg:col-span-2 space-y-8">
          
          {/* LIVE MEDICINE WIDGET */}
          <section className="rounded-2xl bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h3 className="mb-6 text-xl font-bold text-slate-800">Active Prescriptions</h3>
            
            {medicines.length === 0 ? (
               <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">No active medicines prescribed.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {medicines.map((med) => (
                  <div key={med.id} className="flex items-start p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 transition-colors shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 text-2xl mr-4">💊</div>
                    <div>
                      <h4 className="font-bold text-slate-800">{med.name}</h4>
                      <p className="text-xs font-semibold text-blue-600 mt-1">{med.dosage}</p>
                      <p className="text-xs text-slate-500 mt-1">{med.timing}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* LIVE LAB REPORTS WIDGET */}
          <section className="rounded-2xl bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h3 className="mb-6 text-xl font-bold text-slate-800">Recent Lab Reports</h3>
            
            {reports.length === 0 ? (
               <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">No lab reports available yet.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors cursor-pointer shadow-sm">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mr-4">📄</div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{report.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Uploaded: {report.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                      {report.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR: Diet & Booking */}
        <div className="space-y-8">
          <section className="rounded-2xl bg-gradient-to-b from-indigo-900 to-slate-900 p-6 md:p-8 shadow-xl text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Nutrition Engine</h3>
              <span className="text-2xl">🧬</span>
            </div>
            <div className="mb-6">
              <p className="text-indigo-200 text-sm font-medium mb-3">Active Medical Restrictions:</p>
              <div className="flex flex-wrap gap-2">
                {dietRestrictions.map(res => <span key={res} className="text-xs font-bold bg-indigo-500/30 text-indigo-100 px-2.5 py-1 rounded-md">{res}</span>)}
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-8 leading-relaxed">Generate a personalized, medically-safe meal plan using our AI profiler.</p>
            <Link to="/diet" className="block w-full text-center rounded-xl bg-white py-3.5 text-sm font-bold text-slate-900 transition-all hover:bg-indigo-50">Start Diagnostic Quiz</Link>
          </section>

          <Link to="/book" className="block w-full rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-left transition-all hover:-translate-y-1 group">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">🩺</div>
              <div>
                <h4 className="font-bold text-slate-800">Book Home Visit</h4>
                <p className="text-xs text-slate-500 mt-1">Schedule a nurse for tomorrow</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      {/* THE LIVE CHAT WIDGET */}
      <ChatWidget role="patient" userName={patientName} />
    </div>
  );
}