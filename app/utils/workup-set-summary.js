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

function formatDuration(value) {
  if (!(value)) {
    return null;
  }

  let h = Math.trunc(value / (60 * 60));
  let m = Math.trunc((value - 60 * 60 * h) / 60);
  let s = value - 60 * 60 * h - 60 * m;

  return `${h < 99 ? ('0' + h).slice(-2) : h}:${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`;
}

export {getWeightedPulse, getHours, getEstimatedScore, getActualScore, formatDuration};
