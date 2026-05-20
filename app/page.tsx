'use client'

import { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'

// EmailJS Config
const EMAILJS_PUBLIC_KEY = 'vd292Fz6W89XFSM10'
const EMAILJS_SERVICE_ID = 'almohannadimanpower_1978'
const EMAILJS_TEMPLATE_ID = 'template_057w505'

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  })
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY)
    console.log('EmailJS initialized with key:', EMAILJS_PUBLIC_KEY)

    // Particles
    const container = document.getElementById('particle-container')
    if (container) {
      for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div')
        particle.className = 'particle'
        const size = Math.random() * 6 + 2
        particle.style.width = size + 'px'
        particle.style.height = size + 'px'
        particle.style.left = Math.random() * 100 + '%'
        particle.style.animationDuration = Math.random() * 12 + 6 + 's'
        particle.style.animationDelay = Math.random() * 15 + 's'
        particle.style.opacity = (Math.random() * 0.5 + 0.1).toString()
        container.appendChild(particle)
      }
    }

    // Countdown
    const launchDate = new Date(2026, 5, 1, 0, 0, 0).getTime()
    const updateCountdown = () => {
      const now = new Date().getTime()
      let distance = launchDate - now
      if (distance < 0) distance = 0
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (86400000)) / 3600000)
      const minutes = Math.floor((distance % 3600000) / 60000)
      const seconds = Math.floor((distance % 60000) / 1000)
      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      })
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // Send Welcome Email
  const sendWelcomeEmail = async (email: string) => {
    console.log('Attempting to send email to:', email)
    console.log('Using Service ID:', EMAILJS_SERVICE_ID)
    console.log('Using Template ID:', EMAILJS_TEMPLATE_ID)
    
    try {
      const templateParams = {
        to_email: email,
        from_name: email.split('@')[0],
        to_name: email.split('@')[0],
        user_email: email,
        message: `Welcome to AL-MOHANNADI MANPOWER waitlist!`
      }
      
      console.log('Template params:', templateParams)
      
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      )
      
      console.log('EmailJS Response:', response)
      console.log('Email sent successfully! Status:', response.status)
      return true
      
    } catch (error) {
      console.error('EmailJS Error Details:', error)
      return false
    }
  }

  const saveToLocalStorage = (email: string) => {
    let list: string[] = []
    const existing = localStorage.getItem('alm_manpower_waitlist')
    if (existing) {
      try { list = JSON.parse(existing) } catch(e) { list = [] }
    }
    if (!list.includes(email)) {
      list.push(email)
      localStorage.setItem('alm_manpower_waitlist', JSON.stringify(list))
    }
  }

  const isAlreadySubscribed = (email: string) => {
    const existing = localStorage.getItem('alm_manpower_waitlist')
    if (existing) {
      try { return JSON.parse(existing).includes(email) } catch(e) { return false }
    }
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailInput = document.getElementById('emailInput') as HTMLInputElement
    const feedback = document.getElementById('feedback')
    
    if (!emailInput || !feedback) return
    
    const email = emailInput.value.trim()
    
    if (!email) {
      feedback.innerHTML = '<div style="padding:10px;background:rgba(255,80,80,0.15);border:1px solid #ff6666;border-radius:40px;color:#ff8888">❌ Please enter your email address</div>'
      setTimeout(() => { feedback.innerHTML = '' }, 3000)
      return
    }
    
    if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/i.test(email)) {
      feedback.innerHTML = '<div style="padding:10px;background:rgba(255,80,80,0.15);border:1px solid #ff6666;border-radius:40px;color:#ff8888">❌ Please enter a valid email</div>'
      setTimeout(() => { feedback.innerHTML = '' }, 3000)
      return
    }
    
    if (isAlreadySubscribed(email)) {
      feedback.innerHTML = '<div style="padding:10px;background:rgba(0,255,255,0.15);border:1px solid #00ffff;border-radius:40px;color:#00ffff">✨ You are already on our waitlist! ✨</div>'
      setTimeout(() => { feedback.innerHTML = '' }, 3000)
      return
    }
    
    setIsLoading(true)
    
    const submitBtn = document.querySelector('.btn-submit') as HTMLButtonElement
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Sending...'
      submitBtn.disabled = true
    }
    
    feedback.innerHTML = '<div style="padding:10px;background:rgba(0,255,255,0.15);border:1px solid #00ffff;border-radius:40px;color:#00ffff">📧 Sending email, please wait...</div>'
    
    // Send email
    const emailSent = await sendWelcomeEmail(email)
    
    if (emailSent) {
      saveToLocalStorage(email)
      feedback.innerHTML = '<div style="padding:10px;background:rgba(0,255,255,0.15);border:1px solid #00ffff;border-radius:40px;color:#00ffff">🎉 Welcome! Check your email for confirmation! 🎉</div>'
      emailInput.value = ''
    } else {
      feedback.innerHTML = '<div style="padding:10px;background:rgba(255,80,80,0.15);border:1px solid #ff6666;border-radius:40px;color:#ff8888">❌ Failed to send email. Please check console for errors!</div>'
    }
    
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Notify Me'
      submitBtn.disabled = false
    }
    
    setIsLoading(false)
    setTimeout(() => { 
      if (feedback.innerHTML.includes('Check your email')) {
        setTimeout(() => { feedback.innerHTML = '' }, 5000)
      } else {
        setTimeout(() => { feedback.innerHTML = '' }, 4000)
      }
    }, 5000)
  }

  if (!mounted) return null

  return (
    <>
      <div className="animated-bg"></div>
      <div className="grid-overlay"></div>
      <div id="particle-container" className="particle-container"></div>
      
      <div className="container">
        <div className="header">
          <div className="logo-box">
            <span className="logo">AL-MOHANNADI</span>
            <span className="logo-badge">MANPOWER</span>
          </div>
          <div className="date-badge">
            <i className="fas fa-calendar-alt"></i> Launch: 06.01.2026
          </div>
        </div>

        <div className="hero">
          <div className="hero-badge">
            <i className="fas fa-gem"></i> WORLD-CLASS RECRUITMENT <i className="fas fa-gem"></i>
          </div>
          <h1 className="gradient-text">COMING SOON</h1>
          <p>The future of global manpower is arriving. Premium talent solutions, seamless experience, and unparalleled excellence.</p>
        </div>

        <div className="countdown-area">
          <div className="countdown">
            <div className="time-block">
              <div className="time-number">{timeLeft.days}</div>
              <div className="time-label">Days</div>
            </div>
            <div className="time-block">
              <div className="time-number">{timeLeft.hours}</div>
              <div className="time-label">Hours</div>
            </div>
            <div className="time-block">
              <div className="time-number">{timeLeft.minutes}</div>
              <div className="time-label">Minutes</div>
            </div>
            <div className="time-block">
              <div className="time-number">{timeLeft.seconds}</div>
              <div className="time-label">Seconds</div>
            </div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-globe-asia"></i></div>
            <div className="stat-info">
              <h3>8+</h3>
              <p>Countries</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-building"></i></div>
            <div className="stat-info">
              <h3>2K+</h3>
              <p>Places</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-handshake"></i></div>
            <div className="stat-info">
              <h3>250+</h3>
              <p>Clients</p>
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon"><i className="fas fa-bolt"></i></div>
            <h3>Lightning Fast Matching</h3>
            <p>AI-powered candidate-job matching in seconds for faster placements</p>
          </div>
          <div className="feature">
            <div className="feature-icon"><i className="fas fa-shield-alt"></i></div>
            <h3>Verified Profiles</h3>
            <p>100% background verified talent pool with authentic credentials</p>
          </div>
          <div className="feature">
            <div className="feature-icon"><i className="fas fa-headset"></i></div>
            <h3>24/7 Dedicated Support</h3>
            <p>From recruitment to onboarding, our team is with you every step</p>
          </div>
        </div>

        <div className="form-wrapper">
          <div className="form-title">
            <i className="fas fa-bell"></i> Get Exclusive Launch Access
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="email" id="emailInput" placeholder="Enter your email address" required />
              <button type="submit" className="btn-submit" disabled={isLoading}>
                <i className="fas fa-paper-plane"></i> Notify Me
              </button>
            </div>
            <div id="feedback" className="feedback"></div>
          </form>
        </div>

        <div className="footer">
          <div className="social">
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
          </div>
          <p>© 2026 AL-MOHANNADI MANPOWER. All Rights Reserved.</p>
          <p style={{ marginTop: '5px' }}>Excellence in Global Recruitment & Manpower Solutions</p>
        </div>
      </div>
    </>
  )
}