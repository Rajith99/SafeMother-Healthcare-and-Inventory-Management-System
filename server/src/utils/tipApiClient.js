import axios from "axios";

const TIP_API_BASE_URL = process.env.TIP_API_BASE_URL;

const LOCAL_TIPS = [
  {
    range: [1, 4],
    tips: [
      { category: "Nutrition", title: "Folic Acid Intake", tip: "Ensure you are taking your daily folic acid supplement (400 mcg). Folic acid is critical in preventing neural tube defects during these first few weeks of fetal development." },
      { category: "Wellness", title: "Rest and Hydration", tip: "You may start feeling fatigued as your body increases progesterone production. Prioritize getting 8 hours of sleep and drink at least 8-10 glasses of water daily." },
      { category: "Fetal Development", title: "Early Cellular Division", tip: "The blastocyst is implanting in the uterine wall. The cells are rapidly dividing and starting to form the embryo and the placenta." }
    ]
  },
  {
    range: [5, 8],
    tips: [
      { category: "Nutrition", title: "Managing Morning Sickness", tip: "Try eating small, frequent meals throughout the day. Ginger tea, dry crackers, and avoiding strong food odors can help manage nausea." },
      { category: "Medical", title: "Schedule Prenatal Checkup", tip: "Book your first prenatal checkup with your midwife or doctor. Start keeping a log of any physical symptoms or questions you want to ask." },
      { category: "Fetal Development", title: "Baby's Heartbeat", tip: "Your baby's heart has started beating! Crucial organs like the brain, spinal cord, and lungs are also beginning to develop." }
    ]
  },
  {
    range: [9, 13],
    tips: [
      { category: "Nutrition", title: "Calcium Absorption", tip: "Incorporate calcium-rich foods like milk, yogurt, and leafy greens. Calcium supports the development of your baby's bones and teeth." },
      { category: "Exercise", title: "Pelvic Floor Health", tip: "Start performing Kegel exercises daily. Strengthening your pelvic floor muscles supports your bladder and uterus during and after pregnancy." },
      { category: "Fetal Development", title: "Moving Fetus", tip: "Your baby is now a fetus! The fingers, toes, and facial features are fully formed, and they can even start making small movements." }
    ]
  },
  {
    range: [14, 20],
    tips: [
      { category: "Nutrition", title: "Iron and Vitamin C", tip: "Boost your iron intake with lean meats, beans, and spinach. Pair them with Vitamin C (like citrus fruits) to enhance absorption and prevent anemia." },
      { category: "Exercise", title: "Low-Impact Movement", tip: "Engage in low-impact exercises like walking, swimming, or prenatal yoga. Regular movement helps relieve backaches and improves energy." },
      { category: "Fetal Development", title: "Hearing Sounds", tip: "Your baby's ears are developing, and they may begin to hear sounds from outside the womb, like your heartbeat and voice." }
    ]
  },
  {
    range: [21, 27],
    tips: [
      { category: "Nutrition", title: "Healthy Fats", tip: "Incorporate healthy fats (DHA/omega-3s) from walnuts, chia seeds, or fish to support your baby's brain and eye development." },
      { category: "Wellness", title: "Feeling the Kick", tip: "You should be feeling regular movements or 'kicks'. Keep track of these kicks as they are a good indicator of your baby's vitality." },
      { category: "Fetal Development", title: "Lungs and Skin", tip: "The baby's lungs are forming surfactant, which helps them expand after birth. Their skin is covered in a protective layer called vernix." }
    ]
  },
  {
    range: [28, 35],
    tips: [
      { category: "Nutrition", title: "High Protein Intake", tip: "Increase protein consumption to support rapid brain and muscle growth in the third trimester. Lean proteins, eggs, and tofu are great options." },
      { category: "Wellness", title: "Side Sleeping", tip: "Sleep on your left side to maximize blood and nutrient flow to the placenta. Use a pregnancy pillow between your knees for comfort." },
      { category: "Fetal Development", title: "Eyes Opening", tip: "Your baby's eyes can now open and close, and they can perceive light from outside. They are gaining weight rapidly to prepare for birth." }
    ]
  },
  {
    range: [36, 42],
    tips: [
      { category: "Wellness", title: "Packing Your Hospital Bag", tip: "Prepare your hospital bag with essentials for yourself and the baby. Include comfortable clothing, personal care items, and baby blankets." },
      { category: "Medical", title: "Signs of Labor", tip: "Familiarize yourself with the signs of labor, such as regular contractions, water breaking, or lower back pressure, and contact your midwife immediately." },
      { category: "Fetal Development", title: "Full Term Preparation", tip: "Your baby is fully formed and positioning head-down in preparation for birth. All systems are mature and ready for life outside the womb." }
    ]
  }
];

function getLocalTipsForWeek(weekNumber) {
  const match = LOCAL_TIPS.find(group => weekNumber >= group.range[0] && weekNumber <= group.range[1]);
  if (match) {
    return match.tips;
  }
  
  return LOCAL_TIPS[LOCAL_TIPS.length - 1].tips;
}


export async function fetchTipsByWeekFromAPI(weekNumber) {
  try {
    const url = `${TIP_API_BASE_URL}/api/tips/week/${weekNumber}`;
    const response = await axios.get(url, { timeout: 3000 });

    if (!response.data?.success || !Array.isArray(response.data?.data)) {
      throw new Error("Invalid response from pregnancy tips API");
    }

    return response.data.data; 
  } catch (error) {
    console.warn(
      `External tips API failed (week ${weekNumber}), using local fallback tips:`,
      error.message
    );
    return getLocalTipsForWeek(weekNumber);
  }
}

