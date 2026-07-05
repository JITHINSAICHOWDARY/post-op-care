import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Diet() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedMeals, setRecommendedMeals] = useState([]);
  
  // The 5-Question Quiz State
  const [answers, setAnswers] = useState({
    dietType: '',      // Q1: Veg/Non-Veg/Vegan
    texture: '',       // Q2: Liquid/Soft/Solid (Crucial for post-surgery)
    goal: '',          // Q3: Healing/Energy/Digestion
    spice: '',         // Q4: Zero/Mild/Medium
    prepTime: ''       // Q5: Quick/Standard
  });

  // TODO: BACKEND - Fetch from patient's Firestore profile
  const patientRestrictions = ["Low-Sodium", "Diabetic-Friendly"];

  // Embedded Meal Database (Expanded with data points for the 5 questions)
  const mealsDatabase = [
    { id: 1, name: "Turmeric Bone Broth", dietType: "Non-Veg", texture: "Liquid", goal: "Digestion", spice: "Zero", prepTime: "Quick", tags: ["Low-Sodium", "Diabetic-Friendly"], emoji: "🥣" },
    { id: 2, name: "Mashed Sweet Potatoes & Lentils", dietType: "Vegan", texture: "Soft", goal: "Energy", spice: "Mild", prepTime: "Standard", tags: ["Low-Sodium", "Diabetic-Friendly"], emoji: "🍠" },
    { id: 3, name: "Steamed White Fish & Zucchini", dietType: "Non-Veg", texture: "Soft", goal: "Healing", spice: "Mild", prepTime: "Quick", tags: ["Low-Sodium", "Diabetic-Friendly"], emoji: "🐟" },
    { id: 4, name: "Spinach & Tofu Power Smoothie", dietType: "Vegan", texture: "Liquid", goal: "Healing", spice: "Zero", prepTime: "Quick", tags: ["Low-Sodium", "Diabetic-Friendly"], emoji: "🥤" },
    { id: 5, name: "Herb Grilled Chicken Breast", dietType: "Non-Veg", texture: "Solid", goal: "Healing", spice: "Medium", prepTime: "Standard", tags: ["Low-Sodium", "Diabetic-Friendly"], emoji: "🍗" },
    { id: 6, name: "Soft Paneer & Mild Pea Curry", dietType: "Veg", texture: "Soft", goal: "Energy", spice: "Medium", prepTime: "Standard", tags: ["Low-Sodium", "Diabetic-Friendly"], emoji: "🍛" },
    { id: 7, name: "Oatmeal with Almond Milk", dietType: "Vegan", texture: "Soft", goal: "Digestion", spice: "Zero", prepTime: "Quick", tags: ["Low-Sodium", "Diabetic-Friendly"], emoji: "🥣" }
  ];

  const handleOptionClick = (question, value) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  // Check if all 5 questions are answered
  const isQuizComplete = Object.values(answers).every(val => val !== '');

  const generateRecommendations = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      // 1. HARD FILTER: Must match doctor restrictions AND user's Diet Type (Veg/Non-Veg)
      const safeMeals = mealsDatabase.filter(meal => {
        const meetsMedical = patientRestrictions.every(res => meal.tags.includes(res));
        const meetsDiet = meal.dietType === answers.dietType || (answers.dietType === 'Non-Veg'); // Non-veg can eat veg, but veg can't eat non-veg
        return meetsMedical && meetsDiet;
      });

      // 2. SCORING ALGORITHM: Rank remaining meals based on the other 4 questions
      const scoredMeals = safeMeals.map(meal => {
        let score = 50; // Base score
        if (meal.texture === answers.texture) score += 20;
        if (meal.goal === answers.goal) score += 15;
        if (meal.spice === answers.spice) score += 10;
        if (meal.prepTime === answers.prepTime) score += 5;
        return { ...meal, matchScore: score };
      });

      // Sort by highest score
      scoredMeals.sort((a, b) => b.matchScore - a.matchScore);
      
      setRecommendedMeals(scoredMeals);
      setIsAnalyzing(false);
      setStep(2);
    }, 1500);
  };

  // Reusable component for the beautiful quiz options
  const QuizOption = ({ label, field, value }) => {
    const isSelected = answers[field] === value;
    return (
      <button
        onClick={() => handleOptionClick(field, value)}
        className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${
          isSelected 
            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform scale-[1.02]' 
            : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all">
        
        {/* STEP 1: The 5-Question Diagnostic Quiz */}
        {step === 1 && !isAnalyzing && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 tracking-widest uppercase">
                Step-by-Step Diagnostic
              </span>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Post-Op Nutrition Profiler</h2>
              <p className="mt-2 text-slate-500 text-sm font-medium">Answer 5 quick questions to build your personalized meal plan.</p>
            </div>

            <div className="space-y-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-8">
              
              {/* Q1 */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">1. What is your primary diet?</h3>
                <div className="grid grid-cols-3 gap-3">
                  <QuizOption label="Vegetarian" field="dietType" value="Veg" />
                  <QuizOption label="Non-Vegetarian" field="dietType" value="Non-Veg" />
                  <QuizOption label="Vegan" field="dietType" value="Vegan" />
                </div>
              </div>

              {/* Q2 */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">2. What food texture can you tolerate right now?</h3>
                <div className="grid grid-cols-3 gap-3">
                  <QuizOption label="Liquids / Soups" field="texture" value="Liquid" />
                  <QuizOption label="Soft / Mashed" field="texture" value="Soft" />
                  <QuizOption label="Solid Foods" field="texture" value="Solid" />
                </div>
              </div>

              {/* Q3 */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">3. What is your main recovery goal today?</h3>
                <div className="grid grid-cols-3 gap-3">
                  <QuizOption label="Tissue Healing" field="goal" value="Healing" />
                  <QuizOption label="Boost Energy" field="goal" value="Energy" />
                  <QuizOption label="Easy Digestion" field="goal" value="Digestion" />
                </div>
              </div>

              {/* Q4 */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">4. What is your spice tolerance?</h3>
                <div className="grid grid-cols-3 gap-3">
                  <QuizOption label="Zero Spice" field="spice" value="Zero" />
                  <QuizOption label="Mild" field="spice" value="Mild" />
                  <QuizOption label="Medium" field="spice" value="Medium" />
                </div>
              </div>

              {/* Q5 */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">5. How much time do you have to prep?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <QuizOption label="Quick & Easy (< 15m)" field="prepTime" value="Quick" />
                  <QuizOption label="Standard Prep" field="prepTime" value="Standard" />
                </div>
              </div>
            </div>

            <button 
              onClick={generateRecommendations} 
              disabled={!isQuizComplete}
              className={`w-full rounded-xl py-4 text-sm font-bold text-white shadow-xl transition-all duration-300 ${
                isQuizComplete 
                  ? 'bg-slate-900 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/30 cursor-pointer' 
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {isQuizComplete ? "Generate Safe Meal Plan" : "Answer all 5 questions to continue"}
            </button>
            <div className="text-center mt-4">
              <Link to="/patient" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Return to Dashboard</Link>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600 mb-6"></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Cross-referencing 5 data points...</h3>
            <p className="text-slate-500 font-medium">Filtering by your medical restrictions.</p>
          </div>
        )}

        {/* STEP 2: The Grid Results (Kept the premium look from last time) */}
        {step === 2 && !isAnalyzing && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Custom Plan</h2>
                <p className="mt-1 text-slate-500 font-medium">Filtered for Low-Sodium & Diabetic-Friendly safety.</p>
              </div>
              <button onClick={() => {setStep(1); setAnswers({dietType:'', texture:'', goal:'', spice:'', prepTime:''});}} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                ↻ Retake Quiz
              </button>
            </div>
            
            {recommendedMeals.length === 0 ? (
               <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-slate-600 font-medium">No meals found that safely match your strict medical restrictions and diet type.</p>
               </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {recommendedMeals.map((meal, index) => (
                  <div key={meal.id} className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200 flex flex-col">
                    {index === 0 && (
                      <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider py-1.5 text-center shadow-sm z-10">
                        ★ Best Match For Your Answers
                      </div>
                    )}
                    <div className="flex items-center p-5">
                      <div className={`flex items-center justify-center h-16 w-16 rounded-xl text-3xl mr-4 ${index === 0 ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                        {meal.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 leading-tight pr-2">{meal.name}</h3>
                          <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{meal.matchScore}%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{meal.texture} • {meal.spice} Spice • {meal.goal}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}