"""
Deterministic Time Scoring Service.
Normalizes journey duration into a 0-100 score where faster, more time-efficient
journeys receive higher scores.
"""

def calculate_time_score(duration_minutes: int, min_duration: int = None, max_duration: int = None) -> int:
    """
    Computes a 0-100 time score.
    Shorter journeys receive higher scores.
    
    Rules:
    - If min_duration and max_duration are provided and max > min:
      Shortest duration receives 100 or near 100.
      Longest duration is scaled proportionally.
    - If single option or min == max:
      Evaluated against standard journey duration benchmarks (e.g. < 90m -> 95, 4h -> 75, 8h -> 50).
    - Missing or zero duration receives a conservative neutral score (50).
    """
    if duration_minutes is None or not isinstance(duration_minutes, (int, float)) or duration_minutes <= 0:
        return 50

    dur_val = float(duration_minutes)

    if min_duration is not None and max_duration is not None and max_duration > min_duration:
        ratio = (dur_val - min_duration) / float(max_duration - min_duration)
        # Ratio 0 (fastest) -> 100; Ratio 1 (slowest) -> 40
        score = 100.0 - (ratio * 60.0)
        return int(round(max(0.0, min(100.0, score))))

    # Absolute benchmark curve:
    # Under 75 mins (direct short flight) -> 95
    # ~240 mins (4 hours) -> 75
    # ~480 mins (8 hours) -> 55
    # ~720 mins (12 hours) -> 40
    # Over 12 hours -> 25-30
    if dur_val <= 60:
        return 98
    elif dur_val <= 120:
        return int(round(98 - ((dur_val - 60) / 60) * 10)) # 98 down to 88
    elif dur_val <= 300:
        # e.g. 235 mins -> ~72-74
        return int(round(88 - ((dur_val - 120) / 180) * 20)) # 88 down to 68
    elif dur_val <= 600:
        return int(round(68 - ((dur_val - 300) / 300) * 25)) # 68 down to 43
    else:
        penalty = min(30.0, ((dur_val - 600) / 600) * 20)
        return int(round(max(15.0, 43.0 - penalty)))
