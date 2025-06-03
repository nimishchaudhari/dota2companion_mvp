import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const webVitals: any = {}
          
          entries.forEach((entry) => {
            switch (entry.entryType) {
              case 'largest-contentful-paint':
                webVitals.LCP = entry.startTime
                break
              case 'first-input':
                webVitals.FID = entry.processingStart - entry.startTime
                break
              case 'layout-shift':
                if (!webVitals.CLS) webVitals.CLS = 0
                webVitals.CLS += entry.value
                break
            }
          })
          
          // Also get First Contentful Paint
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          const paint = performance.getEntriesByType('paint')
          const fcp = paint.find(p => p.name === 'first-contentful-paint')
          
          webVitals.FCP = fcp?.startTime || 0
          webVitals.loadTime = navigation.loadEventEnd - navigation.fetchStart
          webVitals.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
          
          resolve(webVitals)
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
        
        // Fallback timeout
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          const paint = performance.getEntriesByType('paint')
          const fcp = paint.find(p => p.name === 'first-contentful-paint')
          
          resolve({
            FCP: fcp?.startTime || 0,
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart
          })
        }, 5000)
      })
    })
    
    console.log('Performance metrics:', metrics)
    
    // Performance budgets (in milliseconds)
    const BUDGETS = {
      FCP: 2000,      // First Contentful Paint < 2s
      LCP: 4000,      // Largest Contentful Paint < 4s
      FID: 300,       // First Input Delay < 300ms
      CLS: 0.25,      // Cumulative Layout Shift < 0.25
      loadTime: 5000, // Total load time < 5s
      domContentLoaded: 3000 // DOM Content Loaded < 3s
    }
    
    // Check FCP
    if ((metrics as any).FCP) {
      expect((metrics as any).FCP).toBeLessThan(BUDGETS.FCP)
    }
    
    // Check LCP
    if ((metrics as any).LCP) {
      expect((metrics as any).LCP).toBeLessThan(BUDGETS.LCP)
    }
    
    // Check FID (only if user interaction occurred)
    if ((metrics as any).FID) {
      expect((metrics as any).FID).toBeLessThan(BUDGETS.FID)
    }
    
    // Check CLS
    if ((metrics as any).CLS) {
      expect((metrics as any).CLS).toBeLessThan(BUDGETS.CLS)
    }
    
    // Check load time
    expect((metrics as any).loadTime).toBeLessThan(BUDGETS.loadTime)
    
    // Check DOM Content Loaded
    expect((metrics as any).domContentLoaded).toBeLessThan(BUDGETS.domContentLoaded)
  })

  test('should have minimal main thread blocking', async ({ page }) => {
    await page.goto('/')
    
    // Measure long tasks
    const longTasks = await page.evaluate(() => {
      return new Promise((resolve) => {
        const tasks: any[] = []
        
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            tasks.push({
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime
            })
          })
        }).observe({ entryTypes: ['longtask'] })
        
        setTimeout(() => resolve(tasks), 3000)
      })
    })
    
    console.log('Long tasks:', longTasks)
    
    // Should have minimal long tasks (>50ms)
    const significantTasks = (longTasks as any[]).filter(task => task.duration > 100)
    expect(significantTasks.length).toBeLessThan(5)
  })

  test('should load resources efficiently', async ({ page }) => {
    // Monitor network requests
    const requests: any[] = []
    
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      })
    })
    
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Analyze requests
    const jsRequests = requests.filter(r => r.resourceType === 'script')
    const cssRequests = requests.filter(r => r.resourceType === 'stylesheet')
    const imageRequests = requests.filter(r => r.resourceType === 'image')
    
    console.log(`JavaScript files: ${jsRequests.length}`)
    console.log(`CSS files: ${cssRequests.length}`)
    console.log(`Images: ${imageRequests.length}`)
    console.log(`Total requests: ${requests.length}`)
    
    // Performance budgets for requests
    expect(jsRequests.length).toBeLessThan(10) // Max 10 JS files
    expect(cssRequests.length).toBeLessThan(5) // Max 5 CSS files
    expect(requests.length).toBeLessThan(50)   // Max 50 total requests
  })

  test('should have optimized images', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Check image optimization
    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'))
      
      return images.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.width,
        displayHeight: img.height,
        loading: img.loading,
        alt: img.alt
      }))
    })
    
    console.log(`Found ${imageMetrics.length} images`)
    
    // Check that images have proper optimization attributes
    imageMetrics.forEach((img, index) => {
      // Images should have alt text for accessibility
      expect(img.alt, `Image ${index + 1} should have alt text`).toBeTruthy()
      
      // Large images should use lazy loading
      if (img.naturalWidth > 500 || img.naturalHeight > 500) {
        expect(img.loading, `Large image ${index + 1} should use lazy loading`).toBe('lazy')
      }
    })
  })

  test('should minimize bundle size', async ({ page }) => {
    // Intercept and measure JavaScript bundles
    const bundles: any[] = []
    
    page.on('response', async (response) => {
      if (response.url().includes('.js') && response.status() === 200) {
        const contentLength = response.headers()['content-length']
        bundles.push({
          url: response.url(),
          size: contentLength ? parseInt(contentLength) : 0
        })
      }
    })
    
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Calculate total bundle size
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0)
    const mainBundle = bundles.find(b => b.url.includes('index') || b.url.includes('main'))
    
    console.log(`Total JavaScript size: ${(totalSize / 1024).toFixed(2)} KB`)
    console.log(`Main bundle size: ${mainBundle ? (mainBundle.size / 1024).toFixed(2) : 'N/A'} KB`)
    
    // Bundle size budgets
    expect(totalSize).toBeLessThan(2 * 1024 * 1024) // Total < 2MB
    if (mainBundle) {
      expect(mainBundle.size).toBeLessThan(1024 * 1024) // Main bundle < 1MB
    }
  })

  test('should handle memory usage efficiently', async ({ page }) => {
    await page.goto('/')
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null
    })
    
    if (initialMemory) {
      console.log('Initial memory usage:', initialMemory)
      
      // Simulate user interactions to check for memory leaks
      await page.getByPlaceholderText(/search by steam id/i).fill('test')
      await page.getByPlaceholderText(/search by steam id/i).clear()
      
      // Wait and check memory again
      await page.waitForTimeout(1000)
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null
      })
      
      if (finalMemory) {
        console.log('Final memory usage:', finalMemory)
        
        // Memory shouldn't grow significantly
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Less than 50MB increase
      }
    }
  })

  test('should be responsive across device types', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },   // iPhone SE
      { width: 768, height: 1024, name: 'Tablet' },  // iPad
      { width: 1920, height: 1080, name: 'Desktop' } // Full HD
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.reload({ waitUntil: 'networkidle' })
      
      // Check that critical elements are visible
      await expect(page.getByRole('navigation')).toBeVisible()
      await expect(page.getByPlaceholderText(/search by steam id/i)).toBeVisible()
      
      // Measure render time
      const renderTime = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return navigation.loadEventEnd - navigation.fetchStart
      })
      
      console.log(`${viewport.name} render time: ${renderTime.toFixed(2)}ms`)
      
      // Should render quickly on all devices
      expect(renderTime).toBeLessThan(5000)
    }
  })

  test('should handle API response times gracefully', async ({ page }) => {
    // Monitor API requests
    const apiRequests: any[] = []
    
    page.on('response', async (response) => {
      if (response.url().includes('api.opendota.com')) {
        const timing = response.timing()
        apiRequests.push({
          url: response.url(),
          status: response.status(),
          responseTime: timing.responseEnd - timing.requestStart
        })
      }
    })
    
    await page.goto('/')
    
    // Trigger an API call
    await page.getByPlaceholderText(/search by steam id/i).fill('testuser')
    await page.getByRole('button', { name: /search/i }).click()
    
    // Wait for API response
    await page.waitForTimeout(3000)
    
    // Check API performance
    apiRequests.forEach((request, index) => {
      console.log(`API request ${index + 1}: ${request.responseTime}ms`)
      
      // API responses should be reasonably fast
      expect(request.responseTime).toBeLessThan(10000) // 10 seconds max
    })
  })
})