$ProgressPreference = 'SilentlyContinue'

try {
  $email = "timing_test_" + (Get-Random) + "@example.com"
  Write-Host "=== ITINERARY GENERATION TIMING TEST ==="
  Write-Host ""
  Write-Host "Registering user $email..."

  # 1. Register User
  $regBody = @{
    name = "Timing Tester"
    email = $email
    password = "password123"
  } | ConvertTo-Json

  $regRes = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $regBody -ContentType "application/json" -UseBasicParsing
  $accessToken = (ConvertFrom-Json $regRes.Content).data.accessToken
  $headers = @{ Authorization = "Bearer $accessToken" }

  # 2. Generate itinerary for Goa (3-day trip = 9 activities)
  $generateBody = @{
    destination = "Goa"
    coordinates = @{ lat = 15.2993; lng = 74.1240 }
    startDate = "2026-12-01T00:00:00Z"
    endDate = "2026-12-03T00:00:00Z"
    travelers = 2
    budget = 40000
    currency = "INR"
    interests = @("sightseeing", "dining")
    travelStyle = "balanced"
    accommodation = "Hotel"
    foodPreferences = @("local")
    transportation = "Taxi"
    isPublic = $true
  } | ConvertTo-Json -Depth 5

  Write-Host "Generating Goa itinerary (3 days)..."
  $startTime = Get-Date

  $generateRes = Invoke-WebRequest -Uri "http://localhost:5000/api/ai/generate-itinerary" -Method Post -Body $generateBody -ContentType "application/json" -Headers $headers -UseBasicParsing -TimeoutSec 120
  
  $endTime = Get-Date
  $duration = ($endTime - $startTime).TotalMilliseconds

  $generateData = ConvertFrom-Json $generateRes.Content
  $trip = $generateData.data.trip

  Write-Host ""
  Write-Host "=== RESULTS ==="
  Write-Host "HTTP Status: $($generateRes.StatusCode)"
  Write-Host "Total Client Duration: $([math]::Round($duration))ms"
  Write-Host "Trip ID: $($trip._id)"
  Write-Host "Destination: $($trip.destination)"
  Write-Host "Days: $($trip.itinerary.Length)"
  
  $totalActivities = 0
  for ($i = 0; $i -lt $trip.itinerary.Length; $i++) {
    $totalActivities += $trip.itinerary[$i].activities.Length
    Write-Host "  Day $($trip.itinerary[$i].dayNumber): $($trip.itinerary[$i].activities.Length) activities"
  }
  Write-Host "Total Activities: $totalActivities"
  Write-Host ""
  Write-Host "SUCCESS: Generation completed in $([math]::Round($duration / 1000, 1))s"

} catch {
  Write-Host "ERROR: $_"
  if ($_.Exception.Response) {
    try {
      $stream = $_.Exception.Response.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($stream)
      Write-Host "Response: $($reader.ReadToEnd())"
    } catch {
      Write-Host "Could not read error response"
    }
  }
}
