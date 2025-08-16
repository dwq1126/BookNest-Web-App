document.addEventListener('DOMContentLoaded', function() {
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const switchText = document.getElementById('switchText');
  const switchLink = document.getElementById('switchLink');
  const registerFields = document.querySelectorAll('.register-fields');
  const authForm = document.getElementById('authForm');
  let isLogin = true;
 
  switchLink.addEventListener('click', function(e) {
    e.preventDefault();
    isLogin = !isLogin;
 
    if (isLogin) {
      formTitle.textContent = 'Sign In';
      submitBtn.textContent = 'Sign In';
      switchText.textContent = "Don't have an account?";
      switchLink.textContent = 'Sign Up';
      authForm.action = '/auth/login';
      registerFields.forEach(field => {
        field.style.display = 'none';
      });
    } else {
      formTitle.textContent = 'Create Account';
      submitBtn.textContent = 'Create Account';
      switchText.textContent = 'Already have an account?';
      switchLink.textContent = 'Sign In';
      authForm.action = '/auth/register';
       
      registerFields.forEach(field => {
        field.style.display = 'flex';
      });
    }
  });
 
  authForm.addEventListener('submit', function(e) { 
    if (!isLogin) {
      const password = document.getElementById('password').value.trim();
      const confirmPassword = document.getElementById('confirmPassword').value.trim();
      
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        e.preventDefault(); 
      }
    }
  });
});
