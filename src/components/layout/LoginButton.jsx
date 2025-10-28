function LoginButton({ onClick, style }) {
  return (
    <div onClick={onClick} className="sign-in-button" style={style}>
      Sign In / Sign Out
    </div>
  );
}

export default LoginButton;
