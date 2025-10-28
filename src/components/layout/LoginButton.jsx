function LoginButton({ onClick, style }) {
  return (
    <div onClick={onClick} className="sign-in-button" style={style}>
      Sign In / Sign Up
    </div>
  );
}

export default LoginButton;
