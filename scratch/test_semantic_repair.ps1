$ProgressPreference = 'SilentlyContinue'

try {
  $email = "repair_test_" + (Get-Random) + "@example.com"
  Write-Host "=== ITINERARY SEMANTIC REPAIR E2E TEST ==="
  Write-Host ""
  Write-Host "Registering test user $email..."

  # 1. Register User
  $regBody = @{
    name = "Repair Tester"
    email = $email
    password = "password123"
  } | ConvertTo-Json

  $regRes = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $regBody -ContentType "application/json" -UseBasicParsing
  $accessToken = (ConvertFrom-Json $regRes.Content).data.accessToken
  $headers = @{ Authorization = "Bearer $accessToken" }

  $destinations = @(
    @{ name = "Tokyo"; lat = 35.6762; lng = 139.6503 },
    @{ name = "Goa"; lat = 15.2993; lng = 74.1240 },
    @{ name = "Mussoorie"; lat = 30.4599; lng = 78.0664 },
    @{ name = "Paris"; lat = 48.8566; lng = 2.3522 },
    @{ name = "Mumbai"; lat = 19.0760; lng = 72.8777 },
    @{ name = "Chicago"; lat = 41.8781; lng = -87.6298 }
  )

  foreach ($dest in $destinations) {
    Write-Host ""
    Write-Host "----------------------------------------"
    Write-Host "Generating 4-day itinerary for: $($dest.name)..."
    Write-Host "----------------------------------------"

    $generateBody = @{
      destination = $dest.name
      coordinates = @{ lat = $dest.lat; lng = $dest.lng }
      startDate = "2026-12-01T00:00:00Z"
      endDate = "2026-12-04T00:00:00Z" # 4-day trip
      travelers = 2
      budget = 50000
      currency = "INR"
      interests = @("sightseeing", "dining")
      travelStyle = "balanced"
      accommodation = "Hotel"
      foodPreferences = @("local")
      transportation = "Taxi"
      isPublic = $true
    } | ConvertTo-Json -Depth 5

    $startTime = Get-Date
    $generateRes = Invoke-WebRequest -Uri "http://localhost:5000/api/ai/generate-itinerary" -Method Post -Body $generateBody -ContentType "application/json" -Headers $headers -UseBasicParsing -TimeoutSec 180
    $duration = (Get-Date) - $startTime

    $generateData = ConvertFrom-Json $generateRes.Content
    $trip = $generateData.data.trip

    Write-Host "Status: $($generateRes.StatusCode)"
    Write-Host "Duration: $([math]::Round($duration.TotalSeconds, 1)) seconds"
    Write-Host "Generated Trip: $($trip._id)"
    
    foreach ($day in $trip.itinerary) {
      Write-Host "  Day $($day.dayNumber) Theme: $($day.theme)"
      foreach ($act in $day.activities) {
        Write-Host "    - [$($act.time)] $($act.title) (Cost: $($act.cost))"
      }
    }
  }

  Write-Host ""
  Write-Host "=== TEST COMPLETE: ALL DESTINATIONS GENERATED CLEANLY ==="

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
