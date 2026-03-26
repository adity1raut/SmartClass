function OtpInput({ otp, onChange, onKeyDown, onPaste }) {
  return (
    <div className="flex gap-2 justify-between mb-6" onPaste={onPaste}>
      {otp.map((digit, idx) => (
        <input
          key={idx}
          id={`otp-${idx}`}
          className="otp-input"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(idx, e.target.value)}
          onKeyDown={(e) => onKeyDown(idx, e)}
          autoFocus={idx === 0}
        />
      ))}
    </div>
  );
}

export default OtpInput;