// Shows the doctor's image, or a coloured circle with initials if there is no image
const Avatar = ({ name = '', image, size = 64 }) => {
  const initials = name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  if (image) {
    return <img src={image} alt={name} className="avatar-img" style={{ width: size, height: size }} />;
  }
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size / 2.6 }}>
      {initials}
    </div>
  );
};

export default Avatar;