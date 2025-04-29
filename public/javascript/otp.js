document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.otp-input');
  
    // Auto-focus the first input on load
    if (inputs.length > 0) {
      inputs[0].focus();
    }
  
    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        // Allow only digits
        input.value = input.value.replace(/[^0-9]/g, '');
  
        // Move to next input if one digit entered
        if (input.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
  
        // Auto-submit when all inputs are filled
        const filled = Array.from(inputs).every(inp => inp.value.length === 1);
        if (filled) {
          document
            .getElementById('otp-form')
            .dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });
  
      // Go to previous input on backspace
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '' && index > 0) {
          inputs[index - 1].focus();
        }
      });
    });
  });
  
  document.getElementById('otp-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = this;
    const submitButton = form.querySelector('button');
    if (submitButton) {
      submitButton.disabled = true; // Disable button during request
    }
  
    const inputs = document.querySelectorAll('.otp-input');
    let otp = '';
    inputs.forEach(input => (otp += input.value));
  
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
  
    const messageElement = document.getElementById('message');
  
    // Validate email
    if (!email) {
      messageElement.innerText = 'Email is missing from URL!';
      if (submitButton) submitButton.disabled = false;
      return;
    }
  
    // Validate OTP
    if (!otp || otp.length !== 6) {
      messageElement.innerText = 'Please enter all 6 digits of the OTP!';
      if (submitButton) submitButton.disabled = false;
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/verify-otp-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp
        }),
        credentials: 'include'
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Verification failed');
      }
  
      const result = await response.json();
      if (result.success && result.redirect) {
        // Navigate to the redirect URL provided by the backend
        window.location.href = result.redirect;
      } else {
        throw new Error(result.error || 'Invalid response from server');
      }
    } catch (error) {
      messageElement.innerText = error.message || 'An error occurred. Please try again.';
    } finally {
      if (submitButton) submitButton.disabled = false; // Re-enable button
    }
  });