const destinations = [
  { name: 'Goa', lat: 15.2993, lng: 74.1240 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Mussoorie', lat: 30.4599, lng: 78.0664 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 }
];

console.log('=== MULTIPLE DESTINATIONS WEATHER TEST ===');

const testNext = async (index) => {
  if (index >= destinations.length) {
    console.log('All tests completed successfully!');
    return;
  }
  const dest = destinations[index];
  const url = `http://localhost:5000/api/weather?latitude=${dest.lat}&longitude=${dest.lng}`;
  console.log(`Testing ${dest.name}...`);
  try {
    const res = await fetch(url);
    console.log(`  Status: ${res.status}`);
    const body = await res.json();
    if (res.status === 200 && body.success) {
      console.log(`  PASS: Temp=${body.data.current.temperature}°C, Cond=${body.data.current.condition}, Hum=${body.data.current.humidity}%, Wind=${body.data.current.windSpeed} km/h`);
    } else {
      console.log(`  FAIL: ${JSON.stringify(body)}`);
    }
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
  }
  setTimeout(() => testNext(index + 1), 500);
};

testNext(0);
