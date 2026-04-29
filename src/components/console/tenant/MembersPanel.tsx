"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Mail,
  Crown,
  Shield,
  User,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Member {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: "owner" | "admin" | "operator";
  joinedAt: string;
}

interface MembersPanelProps {
  tenantId: string;
}

const roleConfig: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }> = {
  owner: { label: "所有者", icon: <Crown className="w-3 h-3" />, variant: "default" },
  admin: { label: "管理员", icon: <Shield className="w-3 h-3" />, variant: "secondary" },
  operator: { label: "运营", icon: <User className="w-3 h-3" />, variant: "outline" },
};

export function MembersPanel({ tenantId }: MembersPanelProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "operator">("operator");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [tenantId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/console/tenants/${tenantId}/members`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    try {
      const res = await fetch(`/api/console/tenants/${tenantId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        setInviteEmail("");
        fetchMembers();
      }
    } catch {
      // ignore
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("确定要移除该成员吗？")) return;

    try {
      const res = await fetch(`/api/console/tenants/${tenantId}/members/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch {
      // ignore
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/console/tenants/${tenantId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Invite Form */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="输入邮箱邀请成员"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-10"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "admin" | "operator")}
              className="h-10 px-3 rounded-md border border-slate-200 text-sm"
            >
              <option value="admin">管理员</option>
              <option value="operator">运营</option>
            </select>
            <Button
              type="submit"
              disabled={inviting || !inviteEmail}
              className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white"
            >
              {inviting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" /> 邀请
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Members List */}
      {members.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="w-5 h-5" />}
            title="暂无成员"
            description="邀请成员加入租户，共同管理业务"
          />
        </Card>
      ) : (
        <div className="grid gap-2">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {member.name || member.email}
                        </span>
                        <Badge
                          variant={roleConfig[member.role]?.variant || "default"}
                          className="flex items-center gap-1"
                        >
                          {roleConfig[member.role]?.icon}
                          {roleConfig[member.role]?.label || member.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      加入于 {new Date(member.joinedAt).toLocaleDateString()}
                    </span>

                    {member.role !== "owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(member.id, "admin")}
                            disabled={member.role === "admin"}
                          >
                            设为管理员
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(member.id, "operator")}
                            disabled={member.role === "operator"}
                          >
                            设为运营
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemove(member.id)}
                            className="text-red-600"
                          >
                            移除成员
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
