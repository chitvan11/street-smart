import React from "react";

// --- Register Modal Component ---
const RegisterModal = ({ isOpen, onClose, openLogin, setIsLoggedIn }) => {
    
    // Mock register function
    const handleRegister = (e) => {
        e.preventDefault();
        // Mock successful registration/login
        setIsLoggedIn(true);
        onClose();
    };

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="login-modal" onClick={e => e.stopPropagation()}>
                
                {/* Close Button (X) */}
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                
                {/* Left Panel: Woman Silhouette Illustration (Register - Empowerment) */}
                <div className="modal-left">
                    <div className="woman-silhouette-illustration">
                        <div className="woman-head"></div>
                        <div className="woman-neck"></div>
                        <div className="woman-shoulder"></div>
                        <div className="woman-laurel">
                            <div className="laurel-branch left"></div>
                            <div className="laurel-branch right"></div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form Side (Flax Yellow) */}
                <div className="modal-right">
                    
                    <div className="login-form-card">
                        
                        <div className="form-header">
                            SIGN-UP
                            <a href="mailto:chitvansingh11@gmail.com" className="help-link">
                                Need help?
                            </a>
                        </div>
                        
                        <form onSubmit={handleRegister}>
                            
                            <div className="form-field">
                                <label htmlFor="reg-name">Your Full Name</label>
                                <input id="reg-name" type="text" placeholder="" />
                            </div>

                            <div className="form-field">
                                <label htmlFor="reg-email">Email Address</label>
                                <input id="reg-email" type="email" placeholder="" />
                            </div>

                            <div className="form-field">
                                <label htmlFor="reg-password">Create Password</label>
                                <input id="reg-password" type="password" placeholder="" />
                            </div>

                            <button type="submit" className="form-submit-btn">
                                CREATE ACCOUNT
                            </button>
                        </form>
                    </div>

                    <div className="create-account-link">
                        Already have an account?
                        <span onClick={openLogin}>Sign In</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
export default RegisterModal;