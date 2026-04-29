"use client";

import { useState, useEffect } from "react";
import { X, Loader2, User, Mail, Phone, Building, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import type { Staff, CreateStaffRequest } from "@/types/backoffice/staff";
import type { Role } from "@/types/backoffice/role";
import { departments } from "@/lib/backoffice/mock-staff";
import { useStaffStore } from "@/store/crm/staffStore";

interface StaffFormProps {
  staff: Staff | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  roles: Role[];
}

export function StaffForm({ staff, open, onOpenChange, onSuccess, roles }: StaffFormProps) {
  const { createStaff, updateStaff, isSubmitting } = useStaffStore();
  const isEditing = !!staff;

  const [formData, setFormData] = useState<CreateStaffRequest>({
    username: "",
    email: "",
    phone: "",
    fullName: "",
    roleId: "",
    department: "",
    sendWelcomeEmail: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (staff) {
        setFormData({
          username: staff.username,
          email: staff.email,
          phone: staff.phone || "",
          fullName: staff.fullName,
          roleId: staff.roleId,
          department: staff.department || "",
          sendWelcomeEmail: false,
        });
      } else {
        setFormData({
          username: "",
          email: "",
          phone: "",
          fullName: "",
          roleId: "",
          department: "",
          sendWelcomeEmail: true,
        });
      }
      setErrors({});
    }
  }, [open, staff]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "请输入用户名";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = "用户名只能包含字母、数字和下划线，长度3-20位";
    }

    if (!formData.email.trim()) {
      newErrors.email = "请输入邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "请输入姓名";
    }

    if (!formData.roleId) {
      newErrors.roleId = "请选择角色";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isEditing && staff) {
      const result = await updateStaff(staff.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        roleId: formData.roleId,
        department: formData.department,
      });
      if (result) {
        onSuccess();
      }
    } else {
      const result = await createStaff(formData);
      if (result) {
        onSuccess();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "编辑员工" : "添加员工"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Username */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="username">
                用户名 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入用户名"
                  className="pl-10"
                  disabled={isEditing}
                />
              </div>
              {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              <p className="text-xs text-slate-500">用户名只能包含字母、数字和下划线，长度3-20位</p>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              姓名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="请输入员工姓名"
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              邮箱 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱地址"
                className="pl-10"
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入手机号"
                className="pl-10"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              角色 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.roleId}
              onValueChange={(value) => setFormData({ ...formData, roleId: value })}
            >
              <SelectTrigger className={errors.roleId ? "border-red-500" : ""}>
                <SelectValue placeholder="请选择角色" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && <p className="text-sm text-red-500">{errors.roleId}</p>}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">部门</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择部门" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Send Welcome Email */}
          {!isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendWelcomeEmail"
                checked={formData.sendWelcomeEmail}
                onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                className="rounded border-slate-300"
              />
              <Label htmlFor="sendWelcomeEmail" className="text-sm font-normal">
                发送欢迎邮件（包含临时密码）
              </Label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "保存修改" : "创建员工"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
