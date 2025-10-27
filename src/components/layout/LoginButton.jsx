function LoginButton({ onClick, style }) {
  return (
    <div onClick={onClick} style={style}>
      Sign In / Sign Out
    </div>
  );
}

export default LoginButton;
