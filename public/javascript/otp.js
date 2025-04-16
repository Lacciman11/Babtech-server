document.getElementById('otp-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const otp = document.getElementById('otp').value;
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');  // Get the email from the URL query

    if (!otp) {
        document.getElementById('message').innerText = 'Please enter the OTP!';
        return;
    }

    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        const result = await response.json();

        if (response.status === 200) {
            window.location.href = '/reset-password'; // Redirect to reset password page
        } else {
            document.getElementById('message').innerText = result.message;
        }
    } catch (error) {
        document.getElementById('message').innerText = 'An error occurred. Please try again.';
    }
});
