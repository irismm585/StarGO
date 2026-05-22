#!/bin/bash
# StarGo 一键推送脚本
# 使用方法: bash push.sh

set -e

echo "🚀 正在添加文件..."
git add -A

echo "💬 请输入提交说明（直接回车使用默认）:"
read -r commit_msg
if [ -z "$commit_msg" ]; then
  commit_msg="feat: 优化行程规划 - 添加出发城市/演出日期/场馆下拉/城市分组选择"
fi

echo "📝 提交中: $commit_msg"
git commit -m "$commit_msg"

echo "☁️  正在推送到 GitHub..."
echo "   (如果提示输入密码，请输入 GitHub Personal Access Token)"
echo ""
git push origin master

echo "✅ 推送完成！"
