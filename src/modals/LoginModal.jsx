import React from "react";
// --- Login Modal Component ---
const LoginModal = ({ isOpen, onClose, openRegister, setIsLoggedIn }) => {
    
    // Mock login function
    const handleLogin = (e) => {
        e.preventDefault();
        // Mock successful login
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
                
                {/* Left Panel: Butterfly Illustration (Login - Access) */}
                <div className="modal-left">
                    <div className="butterfly-illustration">
                        <div className="butterfly-container">
                            <div className="wing top-left">
                                <span className="wing-dot"></span>
                                <span className="wing-dot"></span>
                            </div>
                            <div className="wing top-right">
                                <span className="wing-dot"></span>
                                <span className="wing-dot"></span>
                            </div>
                            <div className="wing bottom-left">
                                <span className="wing-dot"></span>
                            </div>
                            <div className="wing bottom-right">
                                <span className="wing-dot"></span>
                            </div>
                            <div className="butterfly-body"></div>
                            <div className="butterfly-antenna left"></div>
                            <div className="butterfly-antenna right"></div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form Side (Flax Yellow) */}
                <div className="modal-right">
                    
                    <div className="login-form-card">
                        
                        <div className="form-header">
                            SIGN-IN
                            <a href="mailto:chitvansingh11@gmail.com" className="help-link">
                                Need help?
                            </a>
                        </div>
                        
                        <form onSubmit={handleLogin}>
                            
                            <div className="form-field">
                                <label htmlFor="login-username">Username or Email</label>
                                <input id="login-username" type="text" placeholder="" />
                            </div>

                            <div className="form-field">
                                <label htmlFor="login-password">Enter your password</label>
                                <input id="login-password" type="password" placeholder="" />
                            </div>

                            <button type="submit" className="form-submit-btn">
                                SIGN IN
                            </button>
                        </form>
                    </div>

                    <div className="create-account-link">
                        Don't have an account yet?
                        <span onClick={openRegister}>Sign In</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
export default LoginModal;