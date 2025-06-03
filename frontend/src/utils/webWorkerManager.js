// Web Worker manager for handling heavy computations off the main thread
class WebWorkerManager {
  constructor() {
    this.workers = new Map();
    this.taskQueue = [];
    this.activeTaskId = 0;
    this.maxWorkers = navigator.hardwareConcurrency || 4;
    this.initializeWorkers();
  }

  initializeWorkers() {
    try {
      // Create data processing worker
      const dataWorker = new Worker('/workers/dataProcessor.js');
      dataWorker.onmessage = this.handleWorkerMessage.bind(this, 'dataProcessor');
      dataWorker.onerror = this.handleWorkerError.bind(this, 'dataProcessor');
      
      this.workers.set('dataProcessor', {
        worker: dataWorker,
        busy: false,
        pendingTasks: new Map()
      });

      console.log('Web Workers initialized successfully');
    } catch (error) {
      console.warn('Web Workers not supported or failed to initialize:', error);
    }
  }

  handleWorkerMessage(workerType, event) {
    const { id, type, result, error } = event.data;
    const workerInfo = this.workers.get(workerType);

    if (type === 'WORKER_READY') {
      console.log(`Worker ${workerType} is ready`);
      return;
    }

    if (workerInfo && id) {
      const pendingTask = workerInfo.pendingTasks.get(id);
      
      if (pendingTask) {
        if (type === 'SUCCESS') {
          pendingTask.resolve(result);
        } else if (type === 'ERROR') {
          pendingTask.reject(new Error(error));
        }
        
        workerInfo.pendingTasks.delete(id);
        workerInfo.busy = false;
        
        // Process next task in queue
        this.processQueue();
      }
    }
  }

  handleWorkerError(workerType, error) {
    console.error(`Worker ${workerType} error:`, error);
    
    const workerInfo = this.workers.get(workerType);
    if (workerInfo) {
      // Reject all pending tasks
      workerInfo.pendingTasks.forEach(task => {
        task.reject(new Error('Worker error: ' + error.message));
      });
      workerInfo.pendingTasks.clear();
      workerInfo.busy = false;
    }
  }

  async executeTask(workerType, taskType, data, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const taskId = ++this.activeTaskId;
      const task = {
        id: taskId,
        workerType,
        taskType,
        data,
        resolve,
        reject,
        timestamp: Date.now(),
        timeout: setTimeout(() => {
          reject(new Error(`Task ${taskType} timed out`));
          this.cancelTask(workerType, taskId);
        }, timeout)
      };

      const workerInfo = this.workers.get(workerType);
      if (!workerInfo) {
        reject(new Error(`Worker ${workerType} not available`));
        return;
      }

      if (workerInfo.busy) {
        // Queue the task
        this.taskQueue.push(task);
      } else {
        // Execute immediately
        this.executeTaskImmediately(task);
      }
    });
  }

  executeTaskImmediately(task) {
    const workerInfo = this.workers.get(task.workerType);
    
    if (!workerInfo) {
      task.reject(new Error(`Worker ${task.workerType} not available`));
      return;
    }

    workerInfo.busy = true;
    workerInfo.pendingTasks.set(task.id, task);

    workerInfo.worker.postMessage({
      id: task.id,
      type: task.taskType,
      data: task.data
    });
  }

  processQueue() {
    if (this.taskQueue.length === 0) return;

    // Find available worker
    for (const [workerType, workerInfo] of this.workers) {
      if (!workerInfo.busy && this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        if (task.workerType === workerType) {
          this.executeTaskImmediately(task);
          break;
        } else {
          // Put back if not matching worker type
          this.taskQueue.unshift(task);
        }
      }
    }
  }

  cancelTask(workerType, taskId) {
    const workerInfo = this.workers.get(workerType);
    if (workerInfo) {
      const task = workerInfo.pendingTasks.get(taskId);
      if (task) {
        clearTimeout(task.timeout);
        workerInfo.pendingTasks.delete(taskId);
      }
    }
  }

  // High-level API methods
  async processHeroes(heroes) {
    try {
      return await this.executeTask('dataProcessor', 'PROCESS_HEROES', heroes);
    } catch (error) {
      console.warn('Worker failed, falling back to main thread:', error);
      // Fallback to main thread
      return this.processHeroesSync(heroes);
    }
  }

  async calculateMatchStats(matches) {
    try {
      return await this.executeTask('dataProcessor', 'CALCULATE_MATCH_STATS', matches);
    } catch (error) {
      console.warn('Worker failed, falling back to main thread:', error);
      return this.calculateMatchStatsSync(matches);
    }
  }

  async filterRecommendations(recommendations, filters, userPreferences) {
    try {
      return await this.executeTask('dataProcessor', 'FILTER_RECOMMENDATIONS', {
        recommendations,
        filters,
        userPreferences
      });
    } catch (error) {
      console.warn('Worker failed, falling back to main thread:', error);
      return this.filterRecommendationsSync(recommendations, filters, userPreferences);
    }
  }

  async sortLargeList(items, sortKey, sortOrder = 'asc', filterFn = null) {
    try {
      return await this.executeTask('dataProcessor', 'SORT_LARGE_LIST', {
        items,
        sortKey,
        sortOrder,
        filterFn: filterFn?.toString()
      });
    } catch (error) {
      console.warn('Worker failed, falling back to main thread:', error);
      return this.sortLargeListSync(items, sortKey, sortOrder, filterFn);
    }
  }

  async searchPlayers(players, query, limit = 50) {
    try {
      return await this.executeTask('dataProcessor', 'SEARCH_PLAYERS', {
        players,
        query,
        limit
      });
    } catch (error) {
      console.warn('Worker failed, falling back to main thread:', error);
      return this.searchPlayersSync(players, query, limit);
    }
  }

  async compressData(data) {
    try {
      return await this.executeTask('dataProcessor', 'COMPRESS_DATA', data);
    } catch (error) {
      console.warn('Compression failed:', error);
      return { compressed: JSON.stringify(data), originalSize: 0, compressedSize: 0, ratio: 0 };
    }
  }

  // Synchronous fallback methods (simplified versions)
  processHeroesSync(heroes) {
    return heroes.map(hero => ({
      ...hero,
      searchTerms: `${hero.name} ${hero.localized_name} ${(hero.roles || []).join(' ')}`.toLowerCase(),
      difficultyScore: hero.roles?.length > 2 ? 3 : 1,
      displayName: hero.localized_name || hero.name
    }));
  }

  calculateMatchStatsSync(matches) {
    const wins = matches.filter(m => m.won || ((m.player_slot < 128) === m.radiant_win)).length;
    return {
      totalMatches: matches.length,
      wins,
      losses: matches.length - wins,
      winRate: matches.length > 0 ? (wins / matches.length) * 100 : 0
    };
  }

  filterRecommendationsSync(recommendations, filters, userPreferences) {
    return recommendations.filter(rec => {
      if (filters.roles?.length > 0) {
        const hasMatchingRole = rec.roles?.some(role => filters.roles.includes(role));
        if (!hasMatchingRole) return false;
      }
      return true;
    });
  }

  sortLargeListSync(items, sortKey, sortOrder, filterFn) {
    let filteredItems = filterFn ? items.filter(filterFn) : items;
    
    return filteredItems.sort((a, b) => {
      const aVal = this.getNestedValue(a, sortKey);
      const bVal = this.getNestedValue(b, sortKey);
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  searchPlayersSync(players, query, limit) {
    const normalizedQuery = query.toLowerCase();
    return players
      .filter(player => 
        player.personaName?.toLowerCase().includes(normalizedQuery) ||
        player.steamId?.toString().includes(query)
      )
      .slice(0, limit);
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Cleanup
  destroy() {
    this.workers.forEach(workerInfo => {
      workerInfo.worker.terminate();
      workerInfo.pendingTasks.forEach(task => {
        clearTimeout(task.timeout);
        task.reject(new Error('Worker manager destroyed'));
      });
    });
    this.workers.clear();
    this.taskQueue.length = 0;
  }

  // Performance monitoring
  getStats() {
    const stats = {
      totalWorkers: this.workers.size,
      queueLength: this.taskQueue.length,
      workers: {}
    };

    this.workers.forEach((workerInfo, workerType) => {
      stats.workers[workerType] = {
        busy: workerInfo.busy,
        pendingTasks: workerInfo.pendingTasks.size
      };
    });

    return stats;
  }
}

// Create singleton instance
const webWorkerManager = new WebWorkerManager();

// Export commonly used methods
export const {
  processHeroes,
  calculateMatchStats,
  filterRecommendations,
  sortLargeList,
  searchPlayers,
  compressData,
  getStats
} = webWorkerManager;

export default webWorkerManager;