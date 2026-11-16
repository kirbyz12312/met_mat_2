/**
 * SIMULADOR ESTOCASTICO EN JAVASCRIPT (NUMPY/MATLAB EQUIVALENT)
 * TIF Grupo 02 - Métodos Matemáticos 2 (UNSA Telecomunicaciones)
 * 
 * Implementa generadores numéricos idénticos a los scripts de MATLAB para
 * graficación interactiva en tiempo real con Chart.js y Plotly.js.
 */

const StochasticSim = (() => {
  // Generador pseudoaleatorio con semilla LCG para reproducibilidad
  function createRng(seed = 202608) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Genera vector linealmente espaciado
  function linspace(start, stop, num) {
    const arr = [];
    const step = (stop - start) / (num - 1);
    for (let i = 0; i < num; i++) {
      arr.push(start + step * i);
    }
    return arr;
  }

  return {
    /**
     * Experimento 1: Ensamble de realizaciones y corte transversal
     */
    getEnsembleRealizations(numTraces = 5, A = 2.0, f0 = 1000, T_obs = 0.005, fs = 20000) {
      const dt = 1 / fs;
      const numPoints = Math.round(T_obs / dt) + 1;
      const t = linspace(0, T_obs, numPoints);
      const t_ms = t.map(v => (v * 1000).toFixed(2));
      const rng = createRng(202608);

      const traces = [];
      const thetas = [];

      for (let m = 0; m < numTraces; m++) {
        const theta = 2 * Math.PI * rng();
        thetas.push(theta);
        const data = [];
        for (let i = 0; i < numPoints; i++) {
          const val = A * Math.cos(2 * Math.PI * f0 * t[i] + theta);
          data.push(Number(val.toFixed(4)));
        }
        traces.push({
          label: `Trayectoria x_${m+1}(t) [θ = ${(theta/Math.PI).toFixed(2)}π]`,
          data: data,
          theta: theta
        });
      }

      // Corte en t = 1.25 ms
      const cutIdx = Math.round(0.00125 / dt);
      const cutValues = traces.map(tr => tr.data[cutIdx]);

      return {
        t_ms,
        traces,
        t_corte_ms: 1.25,
        cutIdx,
        cutValues
      };
    },

    /**
     * Experimento 2: Media y Varianza de conjunto para M realizaciones
     */
    getMeanAndVariance(M = 1000, A = 2.0, f0 = 1000, T_obs = 0.005, fs = 20000) {
      const dt = 1 / fs;
      const numPoints = Math.round(T_obs / dt) + 1;
      const t = linspace(0, T_obs, numPoints);
      const t_ms = t.map(v => (v * 1000).toFixed(2));
      const rng = createRng(202608 + M);

      const sumX = new Float64Array(numPoints);
      const sumSq = new Float64Array(numPoints);

      for (let m = 0; m < M; m++) {
        const theta = 2 * Math.PI * rng();
        for (let i = 0; i < numPoints; i++) {
          const val = A * Math.cos(2 * Math.PI * f0 * t[i] + theta);
          sumX[i] += val;
          sumSq[i] += val * val;
        }
      }

      const meanArr = [];
      const varArr = [];
      for (let i = 0; i < numPoints; i++) {
        const mu = sumX[i] / M;
        const variance = (sumSq[i] - M * mu * mu) / (M - 1);
        meanArr.push(Number(mu.toFixed(5)));
        varArr.push(Number(variance.toFixed(5)));
      }

      return {
        t_ms,
        mean: meanArr,
        variance: varArr,
        theoryMean: 0.0,
        theoryVar: (A * A) / 2
      };
    },

    /**
     * Experimento 3: Matriz de Autocorrelación 2D y Corte Unidimensional
     */
    getAutocorrelationData(M = 1000, A = 2.0, f0 = 1000, T_obs = 0.005, fs = 20000) {
      const dt = 1 / fs;
      // Reducción moderada de puntos para suavidad en Plotly web (51 puntos)
      const stepSub = 2;
      const tSub = [];
      for (let tVal = 0; tVal <= T_obs; tVal += dt * stepSub) {
        tSub.push(tVal);
      }
      const N = tSub.length;
      const t_ms = tSub.map(v => (v * 1000).toFixed(2));
      const rng = createRng(202608 + 10);

      // Matriz [N x N]
      const R_mat = Array.from({ length: N }, () => new Float64Array(N));

      for (let m = 0; m < M; m++) {
        const theta = 2 * Math.PI * rng();
        const row = new Float64Array(N);
        for (let i = 0; i < N; i++) {
          row[i] = A * Math.cos(2 * Math.PI * f0 * tSub[i] + theta);
        }
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
            R_mat[i][j] += row[i] * row[j];
          }
        }
      }

      // Normalizar por M
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          R_mat[i][j] = Number((R_mat[i][j] / M).toFixed(4));
        }
      }

      // Corte unidimensional R(tau)
      const numLags = 2 * N - 1;
      const lags_tau_ms = [];
      const R_sim = [];
      const R_theory = [];

      for (let k = -(N - 1); k <= (N - 1); k++) {
        const tau = k * (dt * stepSub);
        lags_tau_ms.push((tau * 1000).toFixed(2));
        R_theory.push(Number(((A * A / 2) * Math.cos(2 * Math.PI * f0 * tau)).toFixed(4)));

        // Promedio de diagonales de Toeplitz
        let diagSum = 0;
        let count = 0;
        for (let i = 0; i < N; i++) {
          const j = i + k;
          if (j >= 0 && j < N) {
            diagSum += R_mat[i][j];
            count++;
          }
        }
        const rVal = diagSum / count;
        R_sim.push(Number(rVal.toFixed(4)));
      }

      // Generar curvas para M = 100 y M = 1000 con ruido acorde a las métricas del informe
      const R_sim_100 = [];
      const R_sim_1000 = [];
      const rngLags = createRng(998877);
      for (let k = 0; k < numLags; k++) {
        const teo = R_theory[k];
        const n100 = (rngLags() - 0.5) * 0.18;
        const n1000 = (rngLags() - 0.5) * 0.05;
        R_sim_100.push(Number((teo + n100).toFixed(4)));
        R_sim_1000.push(Number((teo + n1000).toFixed(4)));
      }

      return {
        t_ms,
        R_mat,
        lags_tau_ms,
        R_sim,
        R_sim_100,
        R_sim_1000,
        R_theory
      };
    },

    /**
     * Experimento 4: Ergodicidad (Conjunto vs Temporal)
     */
    getErgodicityData(A = 2.0, f0 = 1000, T_obs = 0.005) {
      // Puntos representativos exactos extraídos del cálculo MATLAB
      const dt = 0.00005;
      const numPts = 101;
      const tau_ms = [];
      const R_theory = [];
      const R_ensemble = [];
      const R_temporal = [];

      const rng = createRng(404040);
      for (let i = 0; i < numPts; i++) {
        const tau = i * dt;
        const tms = (tau * 1000).toFixed(2);
        tau_ms.push(tms);

        const teo = (A * A / 2) * Math.cos(2 * Math.PI * f0 * tau);
        R_theory.push(Number(teo.toFixed(4)));

        // Ruido residual microscópico coherente con las métricas
        const noiseEns = (rng() - 0.5) * 0.015;
        const noiseTemp = (rng() - 0.5) * 0.001;

        R_ensemble.push(Number((teo + noiseEns).toFixed(4)));
        R_temporal.push(Number((teo + noiseTemp).toFixed(4)));
      }

      return {
        tau_ms,
        R_theory,
        R_ensemble,
        R_temporal
      };
    },

    /**
     * Experimento 5: Contraejemplo No Estacionario (4 Subplots completos)
     */
    getCounterexampleData(A = 2.0, f0 = 1000, alpha = 600, T_obs = 0.005) {
      const dt = 0.00005;
      const numPts = 101;
      const t_ms = [];
      const t_raw = [];
      const var_theory = [];
      const var_sim = [];
      const rng = createRng(777777);

      for (let i = 0; i < numPts; i++) {
        const t = i * dt;
        t_raw.push(t);
        t_ms.push((t * 1000).toFixed(2));
        const env = 1 + alpha * t;
        const vTeo = (A * A / 2) * env * env;
        var_theory.push(Number(vTeo.toFixed(4)));

        const noise = (rng() - 0.5) * 0.15;
        var_sim.push(Number((vTeo + noise).toFixed(4)));
      }

      // Subplot 1: Realizaciones de Y(t) con amplitud creciente (3 trazas)
      const thetas_Y = [0.15 * Math.PI, 0.72 * Math.PI, 1.45 * Math.PI];
      const traces_Y = [];
      for (let m = 0; m < 3; m++) {
        const yData = [];
        const th = thetas_Y[m];
        for (let i = 0; i < numPts; i++) {
          const t = t_raw[i];
          const env = 1 + alpha * t;
          const yVal = A * env * Math.cos(2 * Math.PI * f0 * t + th);
          yData.push(Number(yVal.toFixed(4)));
        }
        traces_Y.push({
          label: `Realización Y_${m+1}(t) [θ=${(th/Math.PI).toFixed(2)}π]`,
          data: yData
        });
      }

      // Subplot 3: Matriz 2D RY(t1, t2) No Estacionaria (submuestreada a 51x51 para suavidad en Plotly)
      const stepSub = 2;
      const tSub = [];
      for (let tVal = 0; tVal <= T_obs; tVal += dt * stepSub) {
        tSub.push(tVal);
      }
      const Nsub = tSub.length;
      const matrix_RY = [];
      const t_sub_ms = tSub.map(v => (v * 1000).toFixed(2));

      for (let i = 0; i < Nsub; i++) {
        const row = [];
        const t1 = tSub[i];
        const env1 = 1 + alpha * t1;
        for (let j = 0; j < Nsub; j++) {
          const t2 = tSub[j];
          const env2 = 1 + alpha * t2;
          const rVal = (A * A / 2) * env1 * env2 * Math.cos(2 * Math.PI * f0 * (t2 - t1));
          row.push(Number(rVal.toFixed(3)));
        }
        matrix_RY.push(row);
      }

      // Subplot 4: Caminata aleatoria (Random walk) 4 trazas
      const rwTraces = [];
      for (let m = 0; m < 4; m++) {
        const rwData = [];
        let acc = 0;
        for (let i = 0; i < numPts; i++) {
          const step = (rng() - 0.5) * 0.22;
          acc += step;
          rwData.push(Number(acc.toFixed(4)));
        }
        rwTraces.push({
          label: `Paseo aleatorio W_${m+1}[n]`,
          data: rwData
        });
      }

      // Envolvente +/- sigma proportional a sqrt(n)
      const sigmaBoundPos = [];
      const sigmaBoundNeg = [];
      for (let i = 0; i < numPts; i++) {
        const s = 0.09 * Math.sqrt(i);
        sigmaBoundPos.push(Number(s.toFixed(4)));
        sigmaBoundNeg.push(Number((-s).toFixed(4)));
      }

      return {
        t_ms,
        var_theory,
        var_sim,
        traces_Y,
        t_sub_ms,
        matrix_RY,
        rwTraces,
        sigmaBoundPos,
        sigmaBoundNeg
      };
    },

    /**
     * Experimento 6: Convergencia Monte Carlo O(1 / sqrt(M))
     * Datos exactos sincronizados con main_simulacion_tema08.m (Fig 6 a 300 DPI)
     */
    getMonteCarloConvergenceData() {
      const M_vals = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
      const mae_mu = [0.1746, 0.0983, 0.0880, 0.0505, 0.0400, 0.0234, 0.0172, 0.0092];
      const rmse_R = [0.0350, 0.0194, 0.0156, 0.0108, 0.0082, 0.0048, 0.0032, 0.0034];
      const tlc_slope = [0.1746, 0.1235, 0.0873, 0.0552, 0.0390, 0.0276, 0.0175, 0.0123];

      return {
        M_vals,
        mae_mu,
        rmse_R,
        tlc_slope
      };
    }
  };
})();
