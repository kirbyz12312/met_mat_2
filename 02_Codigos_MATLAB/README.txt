========================================================================
UNIVERSIDAD NACIONAL DE SAN AGUSTIN DE AREQUIPA (UNSA)
Escuela Profesional de Ingenieria en Telecomunicaciones
Curso: Metodos Matematicos 2 (1702228) - Semestre 2026-B
Docente: Mg. Oswaldo Rene Banda Sayco

TRABAJO DE INVESTIGACION FORMATIVA (TIF) - GRUPO 02
Tema 08: Introduccion a Procesos Estocasticos: Clasificacion,
         Estacionariedad en Sentido Amplio (WSS) y Ergodicidad
========================================================================

INTEGRANTES DEL GRUPO 02:
1. Gutierrez Ccolqque, Franco Arturo
2. Gaimez Ollachica, Fernando
3. Uturunco Cuela, Zaul Francisco
4. Castro Quispe, Fernando Josue
5. Quispe Flores, Benjamin Eduardo

------------------------------------------------------------------------
DESCRIPCION DE LOS ARCHIVOS:
------------------------------------------------------------------------
1. config_parametros.m
   Define y centraliza todos los parametros fisicos del sistema:
   - Amplitud nominal A = 2.0 V, Frecuencia f0 = 1000 Hz.
   - Frecuencia de muestreo fs = 20000 Hz (Nyquist-Shannon con 20 Sa/ciclo).
   - Ventanas de tiempo (T_obs = 5 ms, T_long = 1.0 s).
   - Semilla fija (seed = 202608) para reproducibilidad exacta.

2. generar_proceso_sinusoidal.m
   Genera el ensamble de realizaciones vectorizado para la portadora
   con fase aleatoria uniforme Theta ~ U(0, 2*pi):
   X(t) = A * cos(2*pi*f0*t + Theta).

3. estimar_estadisticas_conjunto.m
   Calcula la media muestral de conjunto, la varianza de conjunto, la
   matriz bidimensional R_X(t1, t2) y extrae el corte unidimensional
   R_X(tau) mediante el promedio de diagonales paralelas de Toeplitz.

4. estimar_estadisticas_temporales.m
   Calcula la media temporal <x(t)>, la potencia temporal <x^2(t)> y la
   autocorrelacion temporal insesgada R_x(tau) mediante xcorr sobre una
   sola trayectoria continua de 1000 ciclos (T = 1.0 s) para validar
   la propiedad de ergodicidad.

5. simular_contraejemplo.m
   Modela procesos no estacionarios para evidenciar la ruptura de WSS:
   - Modulacion con rampa temporal Y(t) = A*(1 + alpha*t)*cos(2*pi*f0*t + Theta).
   - Caminata aleatoria discreta W[n] = sum Z[k] (modelo de ruido de fase).

6. main_simulacion_tema08.m
   Script maestro orquestador. Ejecuta todo el flujo experimental,
   calcula las metricas de error (MAE, RMSE, error relativo porcentual)
   y exporta las 6 figuras a 300 DPI y el reporte numerico.

------------------------------------------------------------------------
INSTRUCCIONES DE EJECUCION:
------------------------------------------------------------------------
1. Abra MATLAB.
2. Establezca este directorio como carpeta actual (Current Folder).
3. En la ventana de comandos, ejecute:
   >> main_simulacion_tema08

El script tardara aproximadamente 5 a 10 segundos en ejecutarse, mostrara
todas las figuras en pantalla y generara el archivo 'metricas_simulacion.txt'.
========================================================================
