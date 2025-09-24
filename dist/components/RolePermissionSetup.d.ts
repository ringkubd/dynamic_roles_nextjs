import React from 'react';
interface RolePermissionSetupProps {
    className?: string;
    onSave?: (roleId: number, permissionIds: number[]) => void;
    onError?: (error: string) => void;
    debug?: boolean;
}
export declare const RolePermissionSetup: React.FC<RolePermissionSetupProps>;
export default RolePermissionSetup;
//# sourceMappingURL=RolePermissionSetup.d.ts.map