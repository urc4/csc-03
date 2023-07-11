from Tempo import Tempo
from Alimentador import Alimentador, Pote, Sensor
import pandas as pd
import numpy as np
from Cachorro import Cachorro
from datetime import datetime, timedelta
import time
import threading
import os
from EscreverHTML import EscreverHTML, update_html_content

def monitorar(cachorro:Cachorro, pote:Pote, sensor:Sensor, endereco_html):
    '''
    Thread responsável por atualizar a tela do simulador em monitoramento.html
    '''
    while True:
        df = pd.DataFrame({'Pote':[], 'Horário Atual':[], 'Última alimentação':[]})
        df = df._append({'Pote':pote.get_peso(),
                    'Horário Atual':cachorro.tempo.get(),
                    'Última alimentação':sensor.hora_ultima_alimentacao}, ignore_index = True)
        df = df.loc[df['Horário Atual'] > cachorro.tempo.get() - timedelta(hours = 1)]
        update_html_content(df, f'{endereco_html}/monitoramento.html')
        time.sleep(10)

def pular_tempo(tempo:Tempo, cachorro:Cachorro, sensor:Sensor, pote:Pote, horarios):
    '''
    Thread responsável por saltos no tempo em intervalos em que não há mudanças de estado do cachorro nem do alimentador
    '''
    while True:
        agora = tempo.get()
        horario_fome = cachorro.get_horario_fome()
        hora_1 = datetime(agora.year, agora.month, agora.day, horarios[0][0], horarios[0][1],0)
        hora_2 = datetime(agora.year, agora.month, agora.day, horarios[1][0], horarios[1][1],0)

        if agora < horario_fome - timedelta(minutes=2) and cachorro.get_estado() == 5 and sensor.ignorar:
            if horario_fome > (hora_1 + timedelta(days=1)):
                sensor.resetar()
                tempo.pular(hora_1 - timedelta(seconds = 10) + timedelta(days = 1))
            elif horario_fome > hora_1 and agora < hora_1 - timedelta(minutes=2):
                sensor.resetar()
                tempo.pular(hora_1 - timedelta(seconds=10))
            elif horario_fome > hora_1 and horario_fome < hora_2 and agora > hora_1 + timedelta(minutes=3):
                sensor.resetar()
                tempo.pular(horario = horario_fome - timedelta(seconds=15))
            elif horario_fome > hora_2 and agora < hora_2 - timedelta(minutes=2):
                sensor.resetar()
                tempo.pular(hora_2 - timedelta(seconds=10))
            elif horario_fome > hora_2 and agora > hora_2 + timedelta(minutes=3):
                sensor.resetar()
                tempo.pular(horario = horario_fome - timedelta(seconds=15))
            else:
                sensor.resetar()
                tempo.pular(horario = horario_fome - timedelta(seconds=15))
        elif agora < hora_1 - timedelta(minutes = 2) and cachorro.get_estado() == 1 and sensor.ignorar:
            sensor.resetar() 
            tempo.pular(horario = hora_1 - timedelta(seconds = 10))
        elif agora > hora_1 + timedelta(minutes = 2) and agora < hora_2 - timedelta(minutes = 2) and cachorro.get_estado() == 1 and sensor.ignorar:
            sensor.resetar()
            tempo.pular(horario = hora_2 - timedelta(seconds = 10))
        elif agora > hora_2 + timedelta(minutes = 2) and cachorro.get_estado() == 1 and sensor.ignorar:
            sensor.resetar()
            tempo.pular(horario = hora_1 + timedelta(days=1) - timedelta(seconds = 10))
        time.sleep(5)

def simulador_1(inicio:datetime, tempo:Tempo, cachorro:Cachorro):
    '''
    Cachorro com rotina de alimentação regular fica doente 7 dias depois do início
    '''
    delta_taxa = float(10/12)
    agora = tempo.get()
    dia_ficar_doente = (inicio + timedelta(days = 15)).day
    while True:
        agora = tempo.get()
        if agora.day == dia_ficar_doente:
            cachorro.atualizar_taxa_fome(-delta_taxa)
            delta_taxa *= 1.3
            dia_ficar_doente += 1
        time.sleep(5)

def simulador_2(inicio:datetime, tempo:Tempo, cachorro:Cachorro):
    '''
    Cachorro possui rotina de alimentação irregular
    '''
    agora = tempo.get()
    dia_novo = (agora + timedelta(days=1)).day
    while True:
        if tempo.get().day == dia_novo:
            cachorro.atualizar_taxa_fome(np.random.normal(0, float(4/12)))
            dia_novo = (tempo.get() + timedelta(days=1)).day
        time.sleep(5)

def simulador_3(inicio:datetime, tempo:Tempo, cachorro:Cachorro):
    '''
    Cachorro com rotina de alimentação irregular fica doente 15 dias depois do início
    '''
    agora = tempo.get()
    delta_taxa = float(10/12)
    dia_novo = (agora + timedelta(days=1)).day
    dia_ficar_doente = inicio + timedelta(days = 15)
    while True:
        agora = tempo.get()
        if agora.day == dia_novo:
            cachorro.atualizar_taxa_fome(np.random.normal(0, float(4/12)))
            dia_novo = (tempo.get() + timedelta(days=1)).day
        if agora.day == dia_ficar_doente.day:
            cachorro.atualizar_taxa_fome(-delta_taxa)
            delta_taxa *= 1.3
            dia_ficar_doente = dia_ficar_doente + timedelta(days = 1)
        time.sleep(5)
        

#! Alterar variáveis
#Horario de inicio da simulação
inicio = datetime(2023, 7, 8, 6, 59, 50)
#Fator de aceleração do tempo (tempo real: fator = 1)
fator = 1
#ThingSpeak: os dados do animal são enciados por ThingSpeak (só deixar True se for simulação em tempo real, pois consome mais tempo de processamento)
thing_speak = True
#ConectarApp: é feita conexão com o aplicativo (se for True, pular_tempo é desativado)
#todo: implementar pular_tempo na situação em que conectarApp == True
conectarApp = True
#Horários programados de alimentação: tupla(hora,minuto)
horarios=[(7, 0), (18, 0)]
#Tipo de simulação
simulacao = simulador_3


#Inicialização
endereco = os.path.dirname(__file__).replace('\\', '/')
tempo = Tempo(inicio, fator = fator)
potes = list()
sensores = list()
alimentadores = list()
cachorros = list()
potes.append(Pote())
sensores.append(Sensor(potes[0], tempo, 0.5, 1, thing_speak))
alimentadores.append(Alimentador(80, tempo, potes[0], sensores[0], conectarApp=conectarApp))
cachorros.append(Cachorro(tempo, potes[0], fome_inicial=40, refeicao_media=80, recuperacao_media=60, tempo_medio_comer=1, taxa_fome = float(60/12), fome_ir_comer=80, fome_parar_comer=95))
alimentadores[0].programar_horarios(horarios)
if not conectarApp:
    threading.Thread(target = pular_tempo, args=(tempo, cachorros[0], sensores[0], potes[0], horarios), daemon = True).start()
threading.Thread(target = simulacao, args=(inicio, tempo, cachorros[0]), daemon = True).start()
threading.Thread(target = monitorar, args=(cachorros[0], potes[0], sensores[0], endereco), daemon = True).start()


try:
    while True:
        time.sleep(5)
        pass
except KeyboardInterrupt:
    if not thing_speak:
        sensores[0].df.to_csv(f"{endereco}/teste_{0}.csv", index=False)
    pass