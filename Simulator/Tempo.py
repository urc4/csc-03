import threading
import time
from datetime import datetime, timedelta

class Tempo():
    def __init__(self, tempo_inicial:datetime, fator = 1, dt = 0.250):
        self.tempo = tempo_inicial
        self.fator = fator
        self.dt = dt
        self.acionar()
   
    def thread_tempo(self):
        while True:
            self.tempo = self.tempo + timedelta(seconds = self.dt)
            time.sleep(self.dt/self.fator)
   
    def get(self):
        return self.tempo
   
    def pausa(self, segundos):
        agora = self.tempo
        while self.tempo < agora + timedelta(seconds = segundos):
            pass
   
    def pausa_dt(self):
        agora = self.tempo
        while self.tempo < agora + timedelta(milliseconds = 1000*self.dt):
            pass
   
    def acionar(self):
        threading.Thread(target = self.thread_tempo, daemon = True).start()
    
    def pular(self, horario:datetime):
        self.tempo = horario