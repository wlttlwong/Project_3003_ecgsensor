export class ECGFilter {
    private prevRaw: number = 0;
    private prevFiltered: number = 0;
    
    // Smoothing factor for Low-Pass (0.1 is a good balance for 130Hz)
    private alpha: number = 0.15; 
    // Feedback coefficient for High-Pass (close to 1.0)
    private m: number = 0.995; 
  
    /**
     * process() takes a raw sample and returns a filtered value.
     * Logic: 
     * 1. High-Pass: y[n] = x[n] - x[n-1] + m * y[n-1]
     * 2. Low-Pass:  z[n] = alpha * y[n] + (1 - alpha) * z[n-1]
     */
    public process(currentRaw: number): number {
      // 1. High-Pass Filter (Baseline Removal)
      const filteredHP = currentRaw - this.prevRaw + (this.m * this.prevFiltered);
      
      // Update memory for High-Pass
      this.prevRaw = currentRaw;
      this.prevFiltered = filteredHP;
  
      // 2. Low-Pass Filter (Smoothing)
      const smoothed = (this.alpha * filteredHP) + ((1 - this.alpha) * this.prevFiltered);
  
      return smoothed;
    }
  
    /**
     * Reset the filter state if the stream restarts
     */
    public reset(): void {
      this.prevRaw = 0;
      this.prevFiltered = 0;
    }
  }