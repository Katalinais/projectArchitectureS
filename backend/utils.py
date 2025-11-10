import time
import math
from collections import deque
from typing import List, Dict, Any

class DataBuffer:       
    def __init__(self, window_seconds=2):
        self.window_seconds = window_seconds
        self.buffer = deque()  
    
    def add(self, data: Dict[str, Any]):
        timestamp = time.time()
        self.buffer.append((timestamp, data))
        self._clean_old_data()
    
    def _clean_old_data(self):
        current_time = time.time()
        cutoff_time = current_time - self.window_seconds
        
        while self.buffer and self.buffer[0][0] < cutoff_time:
            self.buffer.popleft()
    
    def get_data_in_window(self) -> List[Dict[str, Any]]:
        self._clean_old_data()
        return [data for _, data in self.buffer]
    
    def get_last_timestamp(self) -> float:      
        self._clean_old_data()
        if self.buffer:
            return self.buffer[-1][0]
        return 0
    
    def clear(self):
        self.buffer.clear()

def calculate_average(data: List[Dict[str, Any]], field: str = None) -> Any:
    
    if not data:
        return 0.0 if field else {}
    
    if field:
        values = []
        for item in data:
            if field in item:
                value = item[field]
                if isinstance(value, (int, float)):
                    values.append(value)
        
        if not values:
            return 0.0
        
        average = sum(values) / len(values)
        if all(isinstance(v, int) for v in values):
            return float(int(round(average)))
        else:
            return round(average, 2)
    
    keys = data[0].keys()
    result = {}
    
    for key in keys:
        values = []
        for item in data:
            if key in item:
                value = item[key]   
                if isinstance(value, (int, float)):
                    values.append(value)
        
        if values:
            average = sum(values) / len(values)
            if all(isinstance(v, int) for v in values):
                result[key] = int(round(average))
            else:
                result[key] = round(average, 2)
        else:
            result[key] = data[-1].get(key)
    
    return result

def analog_to_db(raw_value, min_value=120, max_value=1023):
    raw_value = max(min_value, min(raw_value, max_value))
    
    normalized = (raw_value - min_value) / (max_value - min_value)

    normalized = max(normalized, 0.0001)
    
    db = 40 + 60 * math.log10(normalized + 1)
    return round(db, 2)
