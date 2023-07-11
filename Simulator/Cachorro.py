from Tempo import Tempo
from Alimentador import Pote
import threading
import numpy as np
from datetime import datetime, timedelta
import time


class Fome:
    def __init__(self, tempo:Tempo, taxa_fome:float, fome_inicial, media_parar_comer, media_ir_comer):
        self.fome = fome_inicial
        self.taxa_fome = taxa_fome
        self.media_parar_comer = media_parar_comer
        self.media_ir_comer = media_ir_comer
        self.desv_parar_comer = 2
        self.desv_ir_comer = 4
        self.tempo = tempo
        threading.Thread(target = self.thread_fome, daemon = True).start()

    def alterar_taxa(self, delta_taxa):
        self.taxa_fome = self.taxa_fome + delta_taxa

    def alterar_fome(self, delta_fome:float):
        self.fome = self.fome + delta_fome

    def alterar_media_parar(self, media_nova):
        self.media_parar_comer = media_nova

    def alterar_media_ir(self, media_nova):
        self.media_ir_comer = media_nova

    def get_taxa(self):
        return self.taxa_fome
    
    def get_fome(self):
        return self.fome
    
    def get_limite_comida(self):
        return self.media_parar_comer + np.random.normal(0, self.desv_parar_comer)
    
    def get_fome_para_comer(self):
        return self.media_ir_comer + np.random.normal(0, self.desv_ir_comer)
    
    def thread_fome(self):
        tempo_anterior = self.tempo.get()
        while True:
            agora = self.tempo.get()
            self.fome = self.fome - (agora-tempo_anterior).seconds*self.taxa_fome/3600
            tempo_anterior = agora
            self.tempo.pausa(10)

class Cachorro:
    def __init__(self, tempo:Tempo, pote:Pote, fome_inicial = 15.0, refeicao_media = 80, recuperacao_media = 60, tempo_medio_comer = 10, taxa_fome = float(60/12), fome_ir_comer = 40, fome_parar_comer = 90, estado_inicial = 1):
        self.estado = estado_inicial
        self.fome = Fome(tempo, taxa_fome, fome_inicial=fome_inicial, media_parar_comer=fome_parar_comer, media_ir_comer=fome_ir_comer)
        self.pote = pote
        self.tempo = tempo
        self.recuperacao_media = recuperacao_media
        self.refeicao_media = refeicao_media
        self.tempo_medio_comer = tempo_medio_comer
        self.taxa_fome = taxa_fome
        self.horario_fome = tempo.get()

        if estado_inicial == 1:
            threading.Thread(target = self.aguardando_comida, daemon = True).start()
        elif estado_inicial == 2:
            threading.Thread(target = self.ir_comer, daemon = True).start()
        elif estado_inicial == 3:
            threading.Thread(target = self.comer, daemon = True).start()
        elif estado_inicial == 4:
            threading.Thread(target = self.voltar, daemon = True).start()
        else:
            threading.Thread(target = self.esperar_fome, daemon = True).start()

    def calcular_hora_fome(self):
        fome_para_comer = self.fome.get_fome_para_comer()
        if self.fome.get_fome() > fome_para_comer:
            delta = (self.fome.get_fome()-fome_para_comer)/self.taxa_fome*60
            self.horario_fome = self.tempo.get() + timedelta(minutes = delta)
        else:
            self.horario_fome = self.tempo.get()

    def get_horario_fome(self):
        return self.horario_fome
    
    def get_estado(self):
        return self.estado
    
    def atualizar_taxa_fome(self, taxa):
        self.taxa_fome = self.taxa_fome + taxa
        self.fome.alterar_taxa(taxa)

    def aguardando_comida(self):
        self.estado = 1
        tem_comida = False
        while not tem_comida:
            if self.pote.get_peso() > 1:
                tem_comida = True
                threading.Thread(target = self.ir_comer, daemon = True).start()
                self.tempo.pausa_dt
    
    def ir_comer(self):
        self.estado = 2
        self.tempo.pausa(5)
        threading.Thread(target = self.comer, daemon = True).start()
    
    def comer(self):
        self.estado = 3
        tempo_comer = self.tempo_medio_comer + np.random.normal(0, float(self.tempo_medio_comer/10))
        tempo_anterior = self.tempo.get()
        limite = self.fome.get_limite_comida()
        self.pote.alterar_perturbacao(5)
        while self.fome.get_fome() < limite and self.pote.get_peso() > 0:
            agora = self.tempo.get()
            comeu = min((agora-tempo_anterior).seconds*self.refeicao_media/60/tempo_comer, 
                        self.pote.get_peso())
            self.fome.alterar_fome(comeu*self.recuperacao_media/self.refeicao_media)
            self.pote.remover(comeu)
            tempo_anterior = agora
            self.tempo.pausa(1)
        self.pote.resetar_perturbacao()
        threading.Thread(target = self.voltar, daemon = True).start()

    def voltar(self):
        self.estado = 4
        self.tempo.pausa(5)
        threading.Thread(target = self.esperar_fome, daemon = True).start()

    def esperar_fome(self):
        self.calcular_hora_fome()
        self.estado = 5
        while self.tempo.get() < self.horario_fome:
            #usando sleep economiza memória
            self.tempo.pausa(1)
        threading.Thread(target = self.aguardando_comida, daemon = True).start()