$ProgressPreference = 'SilentlyContinue'

try {
  $email = "goa_test_" + (Get-Random) + "@example.com"
  Write-Host "Registering user $email..."

  # 1. Register User
  $regBody = @{
    name = "Goa Tester"
    email = $email
    password = "password123"
  } | ConvertTo-Json

  $regRes = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $regBody -ContentType "application/json" -UseBasicParsing
  $accessToken = (ConvertFrom-Json $regRes.Content).data.accessToken
  $headers = @{ Authorization = "Bearer $accessToken" }

  # 2. Call AI generate-itinerary for Goa with coordinates
  $generateBody = @{
    destination = "Goa, India"
    coordinates = @{ lat = 15.2993; lng = 74.1240 }
    startDate = "2026-11-01T00:00:00Z"
    endDate = "2026-11-03T00:00:00Z"
    travelers = 1
    budget = 40000
    currency = "INR"
    interests = @("beaches", "sightseeing")
    travelStyle = "balanced"
    accommodation = "Hotel"
    foodPreferences = @("local")
    transportation = "Metro"
    isPublic = $true
  } | ConvertTo-Json -Depth 5

  Write-Host "Generating Goa itinerary..."
  $generateRes = Invoke-WebRequest -Uri "http://localhost:5000/api/ai/generate-itinerary" -Method Post -Body $generateBody -ContentType "application/json" -Headers $headers -UseBasicParsing
  $generateData = ConvertFrom-Json $generateRes.Content
  $trip = $generateData.data.trip

  Write-Host "Trip Overall Coordinates: lat=$($trip.coordinates.lat), lng=$($trip.coordinates.lng)"
  Write-Host "First Activity Coordinates: lat=$($trip.itinerary[0].activities[0].coordinates.lat), lng=$($trip.itinerary[0].activities[0].coordinates.lng)"

  if ($trip.coordinates.lat -gt 15.0 -and $trip.coordinates.lat -lt 16.0) {
    Write-Host "SUCCESS: Trip centered on Goa! ✅"
  } else {
    Write-Host "FAILURE: Trip NOT centered on Goa! ❌"
  }
} catch {
  Write-Host "ERROR: $_"
  if ($_.Exception.Response) {
    Write-Host "Error Response: $((New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd())"
  }
}
