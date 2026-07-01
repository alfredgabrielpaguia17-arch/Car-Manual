import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdtrtZT3fvdQGi0-FOpiF5dWB3j4AVeFw",
  projectId: "car-manual-f8c57",
  storageBucket: "car-manual-f8c57.firebasestorage.app",
  messagingSenderId: "170622226431",
  appId: "1:170622226431:web:5975e7a6bd0778a365e1ca",
  measurementId: "G-1L9ZX78DH2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedData() {
  const brandQuery = query(collection(db, "brands"));
  const brandDocs = await getDocs(brandQuery);

  const brands = [
    {
      id: "toyota",
      name: "Toyota",
      description: "Reliable Toyota manuals and maintenance guides.",
      maintenanceTips: [
        "Follow the recommended oil change interval every 5,000 to 7,500 miles.",
        "Inspect timing belts and serpentine belts regularly for wear.",
        "Keep coolant levels topped up and use Toyota-approved coolant.",
      ],
      repairTips: [
        "Replace worn brake pads before rotor damage occurs.",
        "Clean or replace the air filter every 15,000 to 30,000 miles.",
        "Check the battery and terminals during routine service.",
      ],
    },
    {
      id: "suzuki",
      name: "Suzuki",
      description: "Compact Suzuki troubleshooting and service help.",
      maintenanceTips: [
        "Use the correct spark plugs and inspect them every 20,000 miles.",
        "Maintain transmission fluid levels for smooth shifting.",
        "Check suspension bushings and shocks often on rough roads.",
      ],
      repairTips: [
        "Replace coolant hoses if they show cracking or soft spots.",
        "Address engine misfires quickly by checking ignition coils.",
        "Inspect the exhaust system for leaks or rust damage.",
      ],
    },
    {
      id: "mitsubishi",
      name: "Mitsubishi",
      description: "Built for adventure Mitsubishi model support.",
      maintenanceTips: [
        "Service 4WD systems annually if equipped.",
        "Rotate tires every 5,000 to 7,500 miles for even wear.",
        "Check differential and transfer case fluid during service.",
      ],
      repairTips: [
        "Replace cabin air filters to keep HVAC performance strong.",
        "Inspect turbochargers on diesel models for oil leaks.",
        "Test wheel bearings for noise after long highway trips.",
      ],
    },
    {
      id: "isuzu",
      name: "Isuzu",
      description: "Tough Isuzu utility and maintenance manuals.",
      maintenanceTips: [
        "Use proper diesel engine oil and service filters frequently.",
        "Check the turbo intake and intercooler for debris build-up.",
        "Inspect chassis and underbody for rust if used off-road.",
      ],
      repairTips: [
        "Monitor fuel injector condition and service as needed.",
        "Maintain cooling system pressure and hoses on diesel engines.",
        "Replace worn drive belts to prevent sudden failures.",
      ],
    },
  ];

  const models = [
    {
      id: "vios",
      brandId: "toyota",
      name: "Vios",
      bodyType: "Sedan",
      fuelType: "Gasoline",
      engine: "1.3L / 1.5L",
      transmission: "CVT / Manual",
      image: "Toyota Vios",
      description: "The Toyota Vios is a compact sedan popular for its fuel efficiency, comfortable cabin, and reliable Toyota engineering.",
      seating: 5,
      horsepower: "98 - 105 hp",
      maintenanceNote: "Oil changes every 5,000 miles, tire rotations every 7,500 miles, and regular cooling system inspections keep the Vios running smoothly.",
      commonIssues: "Typical issues include worn brake pads, spark plug wear, and occasional battery replacement needs.",
    },
    {
      id: "fortuner",
      brandId: "toyota",
      name: "Fortuner",
      bodyType: "SUV",
      fuelType: "Diesel",
      engine: "2.8L Turbo",
      transmission: "AT 6-speed",
      image: "Toyota Fortuner",
      description: "The Toyota Fortuner is a mid-size SUV built for rough roads, with strong diesel torque, spacious seating, and advanced off-road systems.",
      seating: 7,
      horsepower: "201 hp",
      maintenanceNote: "Inspect the 4WD system and differential fluid regularly, and change oil every 7,500 miles for reliable diesel performance.",
      commonIssues: "Watch for suspension wear, brake pad replacement, and routine maintenance of the turbocharger intake system.",
    },
    {
      id: "hilux",
      brandId: "toyota",
      name: "Hilux",
      bodyType: "Pickup",
      fuelType: "Diesel",
      engine: "2.4L / 2.8L",
      transmission: "Manual / AT",
      image: "Toyota Hilux",
      description: "The Toyota Hilux is a rugged pickup known for exceptional durability, towing capacity, and consistent performance in tough conditions.",
      seating: 5,
      horsepower: "148 - 201 hp",
      maintenanceNote: "Replace engine oil and filters frequently, and inspect chassis and suspension before heavy loads to avoid damage.",
      commonIssues: "Common repairs involve brake service, clutch wear, and diesel injector cleaning for sustained performance.",
    },
    {
      id: "ertiga",
      brandId: "suzuki",
      name: "Ertiga",
      bodyType: "MPV",
      fuelType: "Gasoline",
      engine: "1.5L",
      transmission: "Automatic / Manual",
      image: "Suzuki Ertiga",
      description: "The Suzuki Ertiga is a budget-friendly MPV with a spacious interior, flexible seating, and strong fuel economy for small families.",
      seating: 7,
      horsepower: "103 hp",
      maintenanceNote: "Keep the transmission fluid fresh and monitor rear suspension components for smoother family trips.",
      commonIssues: "Watch out for brake pad wear, air conditioner performance, and routine spark plug service.",
    },
    {
      id: "jimny",
      brandId: "suzuki",
      name: "Jimny",
      bodyType: "SUV",
      fuelType: "Gasoline",
      engine: "1.5L",
      transmission: "5-speed Manual",
      image: "Suzuki Jimny",
      description: "The Suzuki Jimny is a compact off-road SUV that excels in tight trails with lightweight construction and robust 4x4 capability.",
      seating: 4,
      horsepower: "102 hp",
      maintenanceNote: "Regular off-road cleaning, differential checks, and suspension inspections are key to keeping the Jimny trail-ready.",
      commonIssues: "Common maintenance includes brake checks, tire pressure control, and clutch adjustment after heavy off-road use.",
    },
    {
      id: "swift",
      brandId: "suzuki",
      name: "Swift",
      bodyType: "Sedan",
      fuelType: "Gasoline",
      engine: "1.2L",
      transmission: "CVT",
      image: "Suzuki Swift",
      description: "The Suzuki Swift is a nimble compact car with responsive handling, attractive styling, and efficient city driving dynamics.",
      seating: 5,
      horsepower: "82 hp",
      maintenanceNote: "Prioritize oil changes every 5,000 miles and inspect belts, brakes, and spark plugs for smooth urban performance.",
      commonIssues: "Typical problems include battery replacements, brake wear, and air filter changes for crisp throttle response.",
    },
    {
      id: "mirage-g4",
      brandId: "mitsubishi",
      name: "Mirage G4",
      bodyType: "Sedan",
      fuelType: "Gasoline",
      engine: "1.2L",
      transmission: "CVT",
      image: "Mitsubishi Mirage G4",
      description: "The Mitsubishi Mirage G4 is a small sedan focused on economy, low running costs, and a compact footprint for city travel.",
      seating: 5,
      horsepower: "78 hp",
      maintenanceNote: "Maintain tire alignment and replace cabin and air filters frequently to preserve fuel efficiency.",
      commonIssues: "Common service tasks include battery checks, fluid inspections, and spark plug replacement.",
    },
    {
      id: "montero-sport",
      brandId: "mitsubishi",
      name: "Montero Sport",
      bodyType: "SUV",
      fuelType: "Diesel",
      engine: "2.4L Turbo",
      transmission: "AT 8-speed",
      image: "Mitsubishi Montero Sport",
      description: "The Mitsubishi Montero Sport is a capable family SUV with off-road heritage, strong diesel torque, and comfortable cabin space.",
      seating: 7,
      horsepower: "181 hp",
      maintenanceNote: "Schedule transmission service and differential fluid checks for reliable long-distance touring.",
      commonIssues: "Regular inspections should cover brake pads, suspension components, and diesel filter replacement.",
    },
    {
      id: "strada",
      brandId: "mitsubishi",
      name: "Strada",
      bodyType: "Pickup",
      fuelType: "Diesel",
      engine: "2.4L",
      transmission: "Manual / AT",
      image: "Mitsubishi Strada",
      description: "The Mitsubishi Strada pickup is designed for work and utility, with a tough chassis, functional cargo bed, and reliable diesel engine.",
      seating: 5,
      horsepower: "134 hp",
      maintenanceNote: "Monitor brake pads closely and service the pickup’s suspension after heavy loads to maintain stability.",
      commonIssues: "Common repairs include clutch adjustment, brake service, and routine diesel injector maintenance.",
    },
    {
      id: "d-max",
      brandId: "isuzu",
      name: "D-Max",
      bodyType: "Pickup",
      fuelType: "Diesel",
      engine: "1.9L / 3.0L",
      transmission: "Manual / AT",
      image: "Isuzu D-Max",
      description: "The Isuzu D-Max is a versatile pickup known for durability, strong towing ability, and efficient diesel performance.",
      seating: 5,
      horsepower: "150 - 190 hp",
      maintenanceNote: "Service diesel filters regularly and inspect the chassis after heavy load duty to avoid premature wear.",
      commonIssues: "Typical service items include brake maintenance, belt replacement, and regular fuel system checks.",
    },
    {
      id: "mu-x",
      brandId: "isuzu",
      name: "mu-X",
      bodyType: "SUV",
      fuelType: "Diesel",
      engine: "1.9L / 3.0L",
      transmission: "AT 6-speed",
      image: "Isuzu mu-X",
      description: "The Isuzu mu-X is a durable family SUV with diesel efficiency, off-road capability, and comfortable seven-seat accommodation.",
      seating: 7,
      horsepower: "150 - 190 hp",
      maintenanceNote: "Keep the turbo system clean and service the cabin air filter for a pleasant, reliable ride.",
      commonIssues: "Watch for brake wear, suspension inspection, and regular diesel fuel maintenance.",
    },
    {
      id: "traviz",
      brandId: "isuzu",
      name: "Traviz",
      bodyType: "Truck",
      fuelType: "Diesel",
      engine: "1.9L",
      transmission: "Manual",
      image: "Isuzu Traviz",
      description: "The Isuzu Traviz is a compact truck optimized for city delivery, offering a durable chassis and efficient diesel economy.",
      seating: 2,
      horsepower: "87 hp",
      maintenanceNote: "Check cargo bed fasteners and perform frequent oil/filter changes for reliable daily delivery performance.",
      commonIssues: "Common service tasks include brake adjustments, tire inspections, and diesel system maintenance.",
    },
  ];

  const troubleshootingItems = [
    { title: "Battery won't start", steps: ["Check battery terminals.", "Check headlights.", "Jump start vehicle.", "Replace battery if needed."] },
    { title: "Engine overheating", steps: ["Turn off engine.", "Wait for cooling.", "Check coolant.", "Inspect radiator."] },
    { title: "Brake noise", steps: ["Inspect brake pads.", "Check rotor.", "Replace worn pads."] },
    { title: "Flat tire", steps: ["Park safely.", "Use jack.", "Replace tire.", "Tighten lug nuts."] },
  ];

  const maintenanceItems = [
    { title: "Oil Change", steps: ["Warm engine.", "Drain oil.", "Replace filter.", "Add new oil.", "Check oil level."] },
    { title: "Coolant", steps: ["Open reservoir.", "Check level.", "Refill coolant."] },
    { title: "Brake Fluid", steps: ["Locate reservoir.", "Inspect fluid.", "Top up if necessary."] },
    { title: "Tire Pressure", steps: ["Use pressure gauge.", "Compare with manufacturer recommendation.", "Inflate if needed."] },
  ];

  const batchWrites = [];
  for (const brand of brands) {
    const brandRef = doc(db, "brands", brand.id);
    batchWrites.push(setDoc(brandRef, brand));
  }

  for (const model of models) {
    const modelRef = doc(db, "models", model.id);
    batchWrites.push(setDoc(modelRef, model));
  }

  for (const model of models) {
    const troubleshootingRef = doc(db, "manuals", `${model.id}-troubleshooting`);
    const maintenanceRef = doc(db, "manuals", `${model.id}-maintenance`);
    batchWrites.push(setDoc(troubleshootingRef, {
      modelId: model.id,
      type: "troubleshooting",
      title: "Basic Troubleshooting",
      sections: troubleshootingItems,
      updatedAt: serverTimestamp(),
    }));
    batchWrites.push(setDoc(maintenanceRef, {
      modelId: model.id,
      type: "maintenance",
      title: "Maintenance Guide",
      sections: maintenanceItems,
      updatedAt: serverTimestamp(),
    }));
  }

  await Promise.all(batchWrites);
}

export { app, db, seedData, collection, doc, getDoc, getDocs, query, where, setDoc, serverTimestamp };
