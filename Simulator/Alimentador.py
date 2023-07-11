from Tempo import Tempo
import time
from datetime import datetime, timedelta
import numpy as np
import requests
import pandas as pd
import threading
import Thingspeak

class Pote():
    def __init__(self):
        self.peso = float(0)
        self.media_perturbacao = 0.05
        #! Lock bloqueia acessos de peso
        self.lock = threading.Lock()
   
    def get_peso_poluido(self):
        self.lock.acquire()
        peso_com_perturbacao = self.peso + np.random.exponential(self.media_perturbacao)
        self.lock.release()
        return peso_com_perturbacao
    
    def get_peso(self):
        self.lock.acquire()
        peso = self.peso
        self.lock.release()
        return peso
    
    def limpar(self):
        self.lock.acquire()
        self.peso = 0
        self.lock.release()

    def adicionar(self, peso:float):
        self.lock.acquire()
        self.peso = self.peso + peso
        self.lock.release()
    
    def remover(self, peso:float):
        self.lock.acquire()
        #* Cuidado para não ter peso negativo
        self.peso = self.peso - peso
        self.lock.release()
    
    def alterar_perturbacao(self, media:float):
        self.media_perturbacao = media
    
    def resetar_perturbacao(self):
        self.media_perturbacao = 0.05

class Sensor():
    '''
    thing_speak == True: enviar dados para o Thing Speak em tempo real
    thing_speak == False: armazenar dados numa data frame que é exportada para csv ao fim da simulação
    '''
    def __init__(self, pote:Pote, tempo:Tempo, margem_erro = 0.5, amostragem = 1, thing_speak = False):
        self.amostragem = amostragem
        self.thing_speak = thing_speak
        self.df = pd.DataFrame({"created_at":[], "field1":[], "field2":[]})
        self.medicao = float(0)
        self.pote = pote
        self.ignorar = True
        self.ligado = True
        self.tempo = tempo
        self.hora_ultima_alimentacao = datetime(1900,1,1)
        self.margem_erro = margem_erro
        self.acionar(tempo, margem_erro)

    def medir(self):
        self.medicao = self.pote.get_peso_poluido()

    def atualizar_ultima_alimentacao(self, hora_alimentacao):
        self.hora_ultima_alimentacao = hora_alimentacao

    def enviar_dado(self, horario:datetime, peso:float):
        if self.thing_speak:
            api_key = "9TGFMY41L0N4FKSR"
            url = "https://api.thingspeak.com/update.json"

            # Prepare the data payload
            payload = {
                "api_key": api_key,
                "field1": round(peso,2),
                "field2": self.hora_ultima_alimentacao.strftime('%Y-%m-%dT%H:%M:%S-03:00'),
                "created_at": horario.strftime('%Y-%m-%dT%H:%M:%S-03:00')
            }

            # Send the HTTP POST request
            response = requests.post(url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"})
            if response.status_code == 200:
                return True
            else:
                return False    
        else:
            self.df = self.df._append({"created_at":horario.strftime('%Y-%m-%dT%H:%M:%S-03:00'), "field1":round(peso,2), "field2":self.hora_ultima_alimentacao.strftime('%Y-%m-%dT%H:%M:%S-03:00')}, ignore_index = True)
            return True
    
    def thread_medicao(self, tempo:Tempo, margem_erro:float, repeticoes = 5):
        peso_anterior = float(0)
        contagem = 0
        while self.ligado:
            if not self.ignorar:
                if abs(self.medicao - peso_anterior) < margem_erro:
                    contagem = contagem + 1
                else:
                    contagem = 0
                    peso_anterior = self.medicao
                if contagem == repeticoes:
                    tentativa = 0
                    while not self.enviar_dado(tempo.get(), self.medicao) and tentativa < 2:
                        tentativa += 1
                    self.ignorar = True
                    contagem = 0
                    peso_anterior = self.medicao
            else:
                if abs(self.medicao - peso_anterior) > margem_erro:
                    self.ignorar = False
                peso_anterior = self.medicao
            
            self.medir()
            tempo.pausa(self.amostragem)
    
    def acionar(self, tempo:Tempo, margem_erro:float, repeticoes = 5):
        threading.Thread(target = self.thread_medicao, args=(tempo, margem_erro, repeticoes), daemon = True).start()

    def resetar(self, limpar_pote = True):
        self.ligado = False
        self.tempo.pausa(self.amostragem*5)
        if limpar_pote:
            self.pote.limpar()
            self.medir()
        self.ligado = True
        self.ignorar = True
        self.acionar(self.tempo, self.margem_erro)     

class Alimentador():
    def __init__(self, qtd, tempo:Tempo, pote:Pote, sensor:Sensor, conectarApp = False):
        self.pote = pote
        self.sensor = sensor
        self.horarios = list((int, int))
        self.tempo = tempo
        self.qtd = qtd
        self.ativado = False
        if conectarApp:
            threading.Thread(target = self.thread_monitorar_app, daemon = True).start()
        threading.Thread(target = self.thread_ativar_alimentacao, daemon = True).start()

    def programar_horarios(self, lista_horarios:list((int, int))):
        self.horarios = lista_horarios
   
    def thread_ativar_alimentacao(self):
        while True:
            agora = self.tempo.get()
            if (agora.hour, agora.minute) in self.horarios:
                self.sensor.atualizar_ultima_alimentacao(agora)
                tempo_colocar = float(self.qtd/20)
                threading.Thread(target = self.thread_alimentacao, daemon = True).start()
                self.ativado = True
                self.tempo.pausa(tempo_colocar)
                self.tempo.pausa(0.250)
                self.ativado = False
                while self.tempo.get().minute == agora.minute:
                    self.tempo.pausa_dt()
                    
    def thread_alimentacao(self):
        qtd_falta = self.qtd
        anterior = self.tempo.get()
        while not self.ativado:
            pass
        while self.ativado:
            agora = self.tempo.get()
            colocar = (agora-anterior).microseconds/45000
            self.pote.adicionar(min(colocar, qtd_falta))
            anterior = agora
            qtd_falta = qtd_falta - min(colocar, qtd_falta)

    def thread_monitorar_app(self):
        while True:
            df = Thingspeak.get_data()
            if not df.empty:
                for index, row in df.iterrows():
                    hora1 = int(row['field1'])
                    minuto1 = int(row['field2'])
                    hora2 = int(row['field3'])
                    minuto2 = int(row['field4'])
                    qtd = int(row['field5'])
                    if hora1 != 0 | minuto1 != 0:
                        self.horarios[0] = (hora1, minuto1)
                        self.qtd = qtd
                    if hora2 != 0 | minuto2 != 0:
                        self.horarios[1] = (hora2, minuto2)
                        self.qtd = qtd
                    if hora1 == 0 & minuto1 == 0 & hora2 == 0 & minuto2 == 0:
                        agora = self.tempo.get()
                        self.sensor.atualizar_ultima_alimentacao(agora)
                        aux = self.qtd
                        self.qtd = qtd
                        tempo_colocar = float(self.qtd/20)
                        threading.Thread(target = self.thread_alimentacao, daemon = True).start()
                        self.ativado = True
                        self.tempo.pausa(tempo_colocar)
                        self.tempo.pausa(0.250)
                        self.ativado = False
                        self.qtd = aux
                Thingspeak.clear_line_in_channel()
            self.tempo.pausa(5)
                        
                        
                    
                        

    


