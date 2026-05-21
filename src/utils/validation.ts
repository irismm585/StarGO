export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return '请输入邮箱地址';
  if (!emailRegex.test(email.trim())) return '邮箱格式不正确';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return '请输入密码';
  if (password.length < 6) return '密码至少6位';
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username.trim()) return '请输入用户名';
  if (username.trim().length < 2) return '用户名至少2个字符';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `请输入${fieldName}`;
  return null;
}
