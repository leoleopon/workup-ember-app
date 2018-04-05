function getWeightedPulse(duration, pulse) {
  return duration * pulse;
}

function getHours(seconds)
{
  return seconds / 3600;
}

function getEstimatedScore(duration, scoreDencity) {
  return getHours(duration) * scoreDencity;
}

function getActualScore(duration, pulse) {
  let zoneScore = [
    0,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    100,
    120,
    140,
  ];

  let p = pulse - 79;
  p = p > 0 ? (p < 110 ? p : 110) : 0;

  let pulseZone = Math.trunc(p / 11);

  return getHours(duration) * zoneScore[pulseZone];
}

export {getWeightedPulse, getHours, getEstimatedScore, getActualScore}
