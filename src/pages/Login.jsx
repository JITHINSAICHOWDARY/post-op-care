import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // 1. Bring in your Firebase bridge
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'; // 2. Bring in Firebase Auth tools

export default function Login() {
  const [role, setRole] = useState('patient');
  // 3. Create state to hold what the user types
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  // 4. The actual Firebase Magic
  const handleLogin = async (e) => {
    e.preventDefault(); // Stops the page from refreshing
    setErrorMsg('');

    try {
      // First, try to log them in normally
      await signInWithEmailAndPassword(auth, email, password);
      
      // If it works, send them to the right dashboard!
      if (role === 'patient') navigate('/patient');
      else navigate('/doctor');

    } catch (error) {
      // HACKATHON TRICK: If the account doesn't exist yet, we will just create it automatically for the demo!
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        if (role === 'patient') navigate('/patient');
        else navigate('/doctor');
      } catch (createError) {
        setErrorMsg("Failed to log in or create account. Check password length (min 6 chars).");
        console.error(createError);
      }
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Please log in to access your secure portal.
          </p>
        </div>

        {/* Show red error message if login fails */}
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
            {errorMsg}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
            <input 
              type="email" 
              required
              value={email} // Connect input to state
              onChange={(e) => setEmail(e.target.value)} // Update state as they type
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" 
              placeholder="name@example.com" 
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
            <input 
              type="password" 
              required
              value={password} // Connect input to state
              onChange={(e) => setPassword(e.target.value)} // Update state as they type
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" 
              placeholder="••••••••" 
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">I am a...</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
          >
            Secure Log In
          </button>
        </form>

      </div>
    </div>
  );
}