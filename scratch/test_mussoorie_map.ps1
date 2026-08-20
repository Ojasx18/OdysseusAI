$ProgressPreference = 'SilentlyContinue'

try {
  $email = "mussoorie_test_" + (Get-Random) + "@example.com"
  Write-Host "Registering user $email..."

  # 1. Register User
  $regBody = @{
    name = "Mussoorie Tester"
    email = $email
    password = "password123"
  } | ConvertTo-Json

  $regRes = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $regBody -ContentType "application/json" -UseBasicParsing
  $accessToken = (ConvertFrom-Json $regRes.Content).data.accessToken
  $headers = @{ Authorization = "Bearer $accessToken" }

  # 2. Call AI generate-itinerary for Mussoorie with coordinates
  $generateBody = @{
    destination = "Mussoorie, Uttarakhand, India"
    coordinates = @{ lat = 30.4599; lng = 78.0664 }
    startDate = "2026-11-01T00:00:00Z"
    endDate = "2026-11-04T00:00:00Z" # 4 Days
    travelers = 1
    budget = 50000
    currency = "INR"
    interests = @("nature", "sightseeing")
    travelStyle = "balanced"
    accommodation = "Hotel"
    foodPreferences = @("local")
    transportation = "Metro"
    isPublic = $true
  } | ConvertTo-Json -Depth 5

  Write-Host "Generating Mussoorie itinerary..."
  $generateRes = Invoke-WebRequest -Uri "http://localhost:5000/api/ai/generate-itinerary" -Method Post -Body $generateBody -ContentType "application/json" -Headers $headers -UseBasicParsing
  $generateData = ConvertFrom-Json $generateRes.Content
  $trip = $generateData.data.trip

  Write-Host "Trip Overall Coordinates: lat=$($trip.coordinates.lat), lng=$($trip.coordinates.lng)"
  Write-Host "Number of Days: $($trip.itinerary.Length)"

  $allUnique = $true
  for ($i = 0; $i -lt $trip.itinerary.Length; $i++) {
    Write-Host "Day $($trip.itinerary[$i].dayNumber) Theme: $($trip.itinerary[$i].theme)"
    for ($j = 0; $j -lt $trip.itinerary[$i].activities.Length; $j++) {
      Write-Host "  Activity: $($trip.itinerary[$i].activities[$j].title) at lat=$($trip.itinerary[$i].activities[$j].coordinates.lat), lng=$($trip.itinerary[$i].activities[$j].coordinates.lng)"
    }
  }

  # Verify different activities on Day 1 vs Day 2
  $day1Act1 = $trip.itinerary[0].activities[0].title
  $day2Act1 = $trip.itinerary[1].activities[0].title

  if ($day1Act1 -eq $day2Act1) {
    $allUnique = $false
  }

  if ($allUnique) {
    Write-Host "SUCCESS: Mussoorie days are unique! ✅"
  } else {
    Write-Host "FAILURE: Mussoorie has duplicate days! ❌"
  }

} catch {
  Write-Host "ERROR: $_"
  if ($_.Exception.Response) {
    Write-Host "Error Response: $((New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd())"
  }
}
