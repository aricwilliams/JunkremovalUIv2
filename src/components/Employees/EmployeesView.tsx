import React, { useState, useMemo } from 'react';
import {
    Users,
    Plus,
    User,
    Calendar,
    Star,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Edit,
    Eye,
    Download,
    Filter,
    Search,
    Clock,
    DollarSign,
    Award,
    Shield,
    Phone,
    Mail,
    MapPin,
    FileText,
    X,
    Save,
    UserCheck,
    Key
} from 'lucide-react';
import { Employee, Certification, PerformanceReview } from '../../types';

const EmployeesView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'schedules' | 'performance'>('overview');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [showEditEmployee, setShowEditEmployee] = useState(false);
    const [showViewEmployee, setShowViewEmployee] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [positionFilter, setPositionFilter] = useState<string>('all');
    const [employeeTypeFilter, setEmployeeTypeFilter] = useState<string>('all');

    // Mock data - in real app this would come from context/API
    const [employees, setEmployees] = useState<Employee[]>([
        {
            id: 'emp-1',
            firstName: 'John',
            lastName: 'Driver',
            email: 'john@company.com',
            phone: '555-0101',
            address: '123 Main St',
            city: 'Wilmington',
            state: 'NC',
            zipCode: '28401',
            employeeType: 'regular',
            position: 'driver',
            status: 'active',
            hireDate: new Date('2022-01-01'),
            portalCredentials: {
                username: 'jdriver',
                email: 'john@company.com',
                password: 'securepass123'
            },
            emergencyContact: {
                name: 'Jane Driver',
                relationship: 'Spouse',
                phone: '555-0102'
            },
            documents: {
                driversLicense: {
                    number: 'DL123456789',
                    expiryDate: new Date('2026-01-01'),
                    state: 'NC'
                },
                backgroundCheck: {
                    completed: true,
                    date: new Date('2021-12-15'),
                    status: 'passed'
                },
                drugTest: {
                    completed: true,
                    date: new Date('2021-12-20'),
                    status: 'passed'
                }
            },
            certifications: [
                {
                    id: 'cert-1',
                    name: 'Commercial Driver License',
                    issuingAuthority: 'NC DMV',
                    issueDate: new Date('2022-01-01'),
                    expiryDate: new Date('2026-01-01'),
                    status: 'active'
                }
            ],
            assignedTruck: '1',
            payRate: {
                hourly: 18,
                overtime: 27
            },
            schedule: {
                monday: { start: '07:00', end: '17:00', available: true },
                tuesday: { start: '07:00', end: '17:00', available: true },
                wednesday: { start: '07:00', end: '17:00', available: true },
                thursday: { start: '07:00', end: '17:00', available: true },
                friday: { start: '07:00', end: '17:00', available: true },
                saturday: { start: '08:00', end: '16:00', available: true },
                sunday: { start: '08:00', end: '16:00', available: false }
            },
            performance: {
                rating: 4.5,
                reviews: [
                    {
                        id: 'review-1',
                        date: new Date('2023-12-01'),
                        reviewer: 'manager-1',
                        rating: 4.5,
                        comments: 'Excellent driver with great safety record',
                        goals: ['Complete advanced driving course', 'Mentor new drivers'],
                        nextReviewDate: new Date('2024-06-01')
                    }
                ]
            },
            notes: 'Experienced driver, excellent safety record',
            created: new Date('2022-01-01'),
            updated: new Date('2024-01-15')
        },
        {
            id: 'emp-2',
            firstName: 'Mike',
            lastName: 'Helper',
            email: 'mike@company.com',
            phone: '555-0201',
            address: '456 Oak Ave',
            city: 'Wilmington',
            state: 'NC',
            zipCode: '28403',
            employeeType: '1099',
            position: 'helper',
            status: 'active',
            hireDate: new Date('2023-03-01'),
            emergencyContact: {
                name: 'Sarah Helper',
                relationship: 'Sister',
                phone: '555-0202'
            },
            documents: {
                driversLicense: {
                    number: 'DL987654321',
                    expiryDate: new Date('2025-06-01'),
                    state: 'NC'
                },
                backgroundCheck: {
                    completed: true,
                    date: new Date('2023-02-15'),
                    status: 'passed'
                },
                drugTest: {
                    completed: true,
                    date: new Date('2023-02-20'),
                    status: 'passed'
                }
            },
            certifications: [],
            assignedCrew: 'crew-1',
            payRate: {
                hourly: 15,
                overtime: 22.5
            },
            schedule: {
                monday: { start: '07:00', end: '17:00', available: true },
                tuesday: { start: '07:00', end: '17:00', available: true },
                wednesday: { start: '07:00', end: '17:00', available: true },
                thursday: { start: '07:00', end: '17:00', available: true },
                friday: { start: '07:00', end: '17:00', available: true },
                saturday: { start: '08:00', end: '16:00', available: false },
                sunday: { start: '08:00', end: '16:00', available: false }
            },
            performance: {
                rating: 4.0,
                reviews: []
            },
            notes: 'Hard worker, learning quickly',
            created: new Date('2023-03-01'),
            updated: new Date('2024-01-10')
        },
        {
            id: 'emp-3',
            firstName: 'Lisa',
            lastName: 'Supervisor',
            email: 'lisa@company.com',
            phone: '555-0301',
            address: '789 Pine St',
            city: 'Wilmington',
            state: 'NC',
            zipCode: '28405',
            employeeType: 'manager',
            position: 'supervisor',
            status: 'active',
            hireDate: new Date('2021-06-01'),
            portalCredentials: {
                username: 'lsupervisor',
                email: 'lisa@company.com',
                password: 'managerpass456'
            },
            emergencyContact: {
                name: 'Tom Supervisor',
                relationship: 'Spouse',
                phone: '555-0302'
            },
            documents: {
                driversLicense: {
                    number: 'DL456789123',
                    expiryDate: new Date('2027-03-01'),
                    state: 'NC'
                },
                backgroundCheck: {
                    completed: true,
                    date: new Date('2021-05-15'),
                    status: 'passed'
                },
                drugTest: {
                    completed: true,
                    date: new Date('2021-05-20'),
                    status: 'passed'
                }
            },
            certifications: [
                {
                    id: 'cert-2',
                    name: 'Safety Management',
                    issuingAuthority: 'OSHA',
                    issueDate: new Date('2022-01-01'),
                    expiryDate: new Date('2025-01-01'),
                    status: 'active'
                }
            ],
            assignedCrew: 'crew-1',
            payRate: {
                hourly: 25,
                overtime: 37.5
            },
            schedule: {
                monday: { start: '06:00', end: '18:00', available: true },
                tuesday: { start: '06:00', end: '18:00', available: true },
                wednesday: { start: '06:00', end: '18:00', available: true },
                thursday: { start: '06:00', end: '18:00', available: true },
                friday: { start: '06:00', end: '18:00', available: true },
                saturday: { start: '07:00', end: '17:00', available: true },
                sunday: { start: '07:00', end: '17:00', available: false }
            },
            performance: {
                rating: 4.8,
                reviews: []
            },
            notes: 'Excellent supervisor, great leadership skills',
            created: new Date('2021-06-01'),
            updated: new Date('2024-01-05')
        },
        {
            id: 'emp-4',
            firstName: 'Sarah',
            lastName: 'Manager',
            email: 'sarah@company.com',
            phone: '555-0401',
            address: '321 Elm St',
            city: 'Wilmington',
            state: 'NC',
            zipCode: '28402',
            employeeType: 'manager',
            position: 'manager',
            status: 'active',
            hireDate: new Date('2020-08-01'),
            portalCredentials: {
                username: 'smanager',
                email: 'sarah@company.com',
                password: 'adminpass789'
            },
            emergencyContact: {
                name: 'David Manager',
                relationship: 'Spouse',
                phone: '555-0402'
            },
            documents: {
                driversLicense: {
                    number: 'DL789123456',
                    expiryDate: new Date('2028-12-01'),
                    state: 'NC'
                },
                backgroundCheck: {
                    completed: true,
                    date: new Date('2020-07-15'),
                    status: 'passed'
                },
                drugTest: {
                    completed: true,
                    date: new Date('2020-07-20'),
                    status: 'passed'
                }
            },
            certifications: [
                {
                    id: 'cert-3',
                    name: 'Project Management Professional',
                    issuingAuthority: 'PMI',
                    issueDate: new Date('2021-01-01'),
                    expiryDate: new Date('2026-01-01'),
                    status: 'active'
                }
            ],
            payRate: {
                hourly: 35,
                overtime: 52.5
            },
            schedule: {
                monday: { start: '08:00', end: '18:00', available: true },
                tuesday: { start: '08:00', end: '18:00', available: true },
                wednesday: { start: '08:00', end: '18:00', available: true },
                thursday: { start: '08:00', end: '18:00', available: true },
                friday: { start: '08:00', end: '18:00', available: true },
                saturday: { start: '09:00', end: '17:00', available: false },
                sunday: { start: '09:00', end: '17:00', available: false }
            },
            performance: {
                rating: 4.9,
                reviews: []
            },
            notes: 'Senior manager, excellent organizational skills',
            created: new Date('2020-08-01'),
            updated: new Date('2024-01-20')
        }
    ]);

    // Calculate statistics
    const stats = useMemo(() => {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        return {
            totalEmployees: employees.length,
            activeEmployees: employees.filter(e => e.status === 'active').length,
            onLeaveEmployees: employees.filter(e => e.status === 'on-leave').length,
            terminatedEmployees: employees.filter(e => e.status === 'terminated').length,
            managers: employees.filter(e => e.employeeType === 'manager').length,
            regularEmployees: employees.filter(e => e.employeeType === 'regular').length,
            contractors: employees.filter(e => e.employeeType === '1099').length,
            drivers: employees.filter(e => e.position === 'driver').length,
            helpers: employees.filter(e => e.position === 'helper').length,
            supervisors: employees.filter(e => e.position === 'supervisor').length,
            averageRating: employees.reduce((sum, e) => sum + e.performance.rating, 0) / employees.length,
            expiringLicenses: employees.filter(e => e.documents.driversLicense.expiryDate <= thirtyDaysFromNow).length,
            pendingReviews: employees.filter(e => {
                const lastReview = e.performance.reviews[e.performance.reviews.length - 1];
                return !lastReview || lastReview.nextReviewDate <= now;
            }).length,
            portalUsers: employees.filter(e => e.portalCredentials).length
        };
    }, [employees]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'on-leave': return 'bg-yellow-100 text-yellow-800';
            case 'terminated': return 'bg-red-100 text-red-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'on-leave': return <Calendar className="w-4 h-4" />;
            case 'terminated': return <XCircle className="w-4 h-4" />;
            case 'inactive': return <User className="w-4 h-4" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    const getPositionColor = (position: string) => {
        switch (position) {
            case 'driver': return 'bg-blue-100 text-blue-800';
            case 'helper': return 'bg-green-100 text-green-800';
            case 'supervisor': return 'bg-purple-100 text-purple-800';
            case 'manager': return 'bg-orange-100 text-orange-800';
            case 'admin': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getEmployeeTypeColor = (employeeType: string) => {
        switch (employeeType) {
            case 'manager': return 'bg-purple-100 text-purple-800';
            case 'regular': return 'bg-blue-100 text-blue-800';
            case '1099': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getEmployeeTypeIcon = (employeeType: string) => {
        switch (employeeType) {
            case 'manager': return <UserCheck className="w-4 h-4" />;
            case 'regular': return <User className="w-4 h-4" />;
            case '1099': return <Award className="w-4 h-4" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    const filteredEmployees = employees.filter(employee => {
        const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
        const matchesPosition = positionFilter === 'all' || employee.position === positionFilter;
        const matchesEmployeeType = employeeTypeFilter === 'all' || employee.employeeType === employeeTypeFilter;
        return matchesStatus && matchesPosition && matchesEmployeeType;
    });

    const getDaysWorked = (hireDate: Date) => {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - hireDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <>
            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Employee Management</h1>
                        <p className="text-sm sm:text-base text-gray-600">Manage employees, schedules, and performance</p>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                            onClick={() => setShowAddEmployee(true)}
                            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Employee</span>
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Employees</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Managers</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.managers}</p>
                            </div>
                            <UserCheck className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Portal Users</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.portalUsers}</p>
                            </div>
                            <Key className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Regular</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.regularEmployees}</p>
                            </div>
                            <User className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">1099 Contractors</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.contractors}</p>
                            </div>
                            <Award className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Rating</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.averageRating.toFixed(1)}</p>
                            </div>
                            <Star className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Expiring Licenses</p>
                                <p className="text-2xl font-bold text-red-600">{stats.expiringLicenses}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <nav className="flex flex-wrap -mb-px">
                            {[
                                { id: 'overview', label: 'Overview', icon: Users },
                                { id: 'employees', label: 'Employees', icon: User },
                                { id: 'schedules', label: 'Schedules', icon: Calendar },
                                { id: 'performance', label: 'Performance', icon: Star }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Employee Status */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Status</h3>
                                        <div className="space-y-3">
                                            {['active', 'on-leave', 'terminated', 'inactive'].map((status) => {
                                                const count = employees.filter(e => e.status === status).length;
                                                const percentage = (count / employees.length) * 100;
                                                return (
                                                    <div key={status} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusIcon(status)}
                                                            <span className="capitalize">{status.replace('-', ' ')}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium">{count}</span>
                                                            <span className="text-sm text-gray-500">({percentage.toFixed(0)}%)</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Employee Type Distribution */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Type Distribution</h3>
                                        <div className="space-y-3">
                                            {['manager', 'regular', '1099'].map((employeeType) => {
                                                const count = employees.filter(e => e.employeeType === employeeType).length;
                                                if (count === 0) return null;
                                                const percentage = (count / employees.length) * 100;
                                                return (
                                                    <div key={employeeType} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            {getEmployeeTypeIcon(employeeType)}
                                                            <span className="capitalize">{employeeType === '1099' ? '1099 Contractor' : employeeType}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium">{count}</span>
                                                            <span className="text-sm text-gray-500">({percentage.toFixed(0)}%)</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Position Distribution */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Distribution</h3>
                                    <div className="space-y-3">
                                        {['driver', 'helper', 'supervisor', 'manager', 'admin'].map((position) => {
                                            const count = employees.filter(e => e.position === position).length;
                                            if (count === 0) return null;
                                            const percentage = (count / employees.length) * 100;
                                            return (
                                                <div key={position} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <User className="w-4 h-4" />
                                                        <span className="capitalize">{position}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">{count}</span>
                                                        <span className="text-sm text-gray-500">({percentage.toFixed(0)}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Alerts */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
                                    <div className="space-y-3">
                                        {stats.expiringLicenses > 0 && (
                                            <div className="flex items-center space-x-2 text-orange-700">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>{stats.expiringLicenses} driver licenses expiring soon</span>
                                            </div>
                                        )}
                                        {stats.pendingReviews > 0 && (
                                            <div className="flex items-center space-x-2 text-blue-700">
                                                <Calendar className="w-4 h-4" />
                                                <span>{stats.pendingReviews} performance reviews due</span>
                                            </div>
                                        )}
                                        {employees.filter(e => e.documents.backgroundCheck.status === 'pending').length > 0 && (
                                            <div className="flex items-center space-x-2 text-yellow-700">
                                                <Shield className="w-4 h-4" />
                                                <span>Background checks pending</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Employees Tab */}
                        {activeTab === 'employees' && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                    <h2 className="text-lg font-semibold text-gray-900">All Employees</h2>
                                    <div className="flex space-x-2">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="on-leave">On Leave</option>
                                            <option value="terminated">Terminated</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        <select
                                            value={positionFilter}
                                            onChange={(e) => setPositionFilter(e.target.value)}
                                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                                        >
                                            <option value="all">All Positions</option>
                                            <option value="driver">Drivers</option>
                                            <option value="helper">Helpers</option>
                                            <option value="supervisor">Supervisors</option>
                                            <option value="manager">Managers</option>
                                            <option value="admin">Admins</option>
                                        </select>
                                        <select
                                            value={employeeTypeFilter}
                                            onChange={(e) => setEmployeeTypeFilter(e.target.value)}
                                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="manager">Managers</option>
                                            <option value="regular">Regular</option>
                                            <option value="1099">1099 Contractors</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {filteredEmployees.map((employee) => (
                                        <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-gray-900">{employee.firstName} {employee.lastName}</h3>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                                                            {getStatusIcon(employee.status)}
                                                            <span className="ml-1 capitalize">{employee.status.replace('-', ' ')}</span>
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEmployeeTypeColor(employee.employeeType)}`}>
                                                            {getEmployeeTypeIcon(employee.employeeType)}
                                                            <span className="ml-1 capitalize">{employee.employeeType === '1099' ? '1099' : employee.employeeType}</span>
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(employee.position)}`}>
                                                            <span className="capitalize">{employee.position}</span>
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                                        <div className="flex items-center space-x-1">
                                                            <Mail className="w-4 h-4" />
                                                            <span>{employee.email}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Phone className="w-4 h-4" />
                                                            <span>{employee.phone}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="w-4 h-4" />
                                                            <span>{employee.performance.rating}/5 rating</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                                        <div>Hired: {employee.hireDate.toLocaleDateString()}</div>
                                                        <div>Days: {getDaysWorked(employee.hireDate)}</div>
                                                        <div>Pay: ${employee.payRate.hourly}/hr</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedEmployee(employee);
                                                                setShowViewEmployee(true);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedEmployee(employee);
                                                                setShowEditEmployee(true);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Schedules Tab */}
                        {activeTab === 'schedules' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Work Schedules</h2>
                                    <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                                        <Plus className="w-4 h-4" />
                                        <span>Update Schedule</span>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {employees.map((employee) => (
                                        <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">{employee.firstName} {employee.lastName}</h3>
                                                    <div className="grid grid-cols-7 gap-2 text-xs">
                                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                                                            const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index];
                                                            const schedule = employee.schedule[dayKey as keyof typeof employee.schedule];
                                                            return (
                                                                <div key={day} className={`p-2 rounded text-center ${schedule.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                                                    <div className="font-medium">{day}</div>
                                                                    {schedule.available && (
                                                                        <div className="text-xs">
                                                                            {schedule.start}-{schedule.end}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Performance Tab */}
                        {activeTab === 'performance' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Performance Reviews</h2>
                                    <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                                        <Plus className="w-4 h-4" />
                                        <span>Add Review</span>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {employees.flatMap(employee =>
                                        employee.performance.reviews.map(review => (
                                            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <h3 className="font-semibold text-gray-900">{employee.firstName} {employee.lastName}</h3>
                                                            <div className="flex items-center space-x-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 text-sm text-gray-600">
                                                            <div>Date: {review.date.toLocaleDateString()}</div>
                                                            <div>Comments: {review.comments}</div>
                                                            <div>Next Review: {review.nextReviewDate.toLocaleDateString()}</div>
                                                            {review.goals.length > 0 && (
                                                                <div>
                                                                    Goals: {review.goals.join(', ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Add Employee Modal */}
            {showAddEmployee && (
                <AddEmployeeModal
                    onClose={() => setShowAddEmployee(false)}
                    onSave={(employee) => {
                        setEmployees([...employees, { ...employee, id: `emp-${Date.now()}`, created: new Date(), updated: new Date() }]);
                        setShowAddEmployee(false);
                    }}
                />
            )}

            {/* Edit Employee Modal */}
            {showEditEmployee && selectedEmployee && (
                <EditEmployeeModal
                    employee={selectedEmployee}
                    onClose={() => {
                        setShowEditEmployee(false);
                        setSelectedEmployee(null);
                    }}
                    onSave={(updatedEmployee) => {
                        setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? { ...updatedEmployee, updated: new Date() } : emp));
                        setShowEditEmployee(false);
                        setSelectedEmployee(null);
                    }}
                />
            )}

            {/* View Employee Modal */}
            {showViewEmployee && selectedEmployee && (
                <ViewEmployeeModal
                    employee={selectedEmployee}
                    onClose={() => {
                        setShowViewEmployee(false);
                        setSelectedEmployee(null);
                    }}
                />
            )}
        </>
    );
};

// Add Employee Modal Component
interface AddEmployeeModalProps {
    onClose: () => void;
    onSave: (employee: Omit<Employee, 'id' | 'created' | 'updated'>) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        employeeType: 'regular' as 'manager' | 'regular' | '1099',
        position: 'helper' as 'driver' | 'helper' | 'supervisor' | 'manager' | 'admin',
        status: 'active' as 'active' | 'inactive' | 'on-leave' | 'terminated',
        hireDate: new Date().toISOString().split('T')[0],
        portalCredentials: {
            username: '',
            email: '',
            password: ''
        },
        emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
        },
        documents: {
            driversLicense: {
                number: '',
                expiryDate: new Date().toISOString().split('T')[0],
                state: ''
            },
            backgroundCheck: {
                completed: false,
                date: new Date().toISOString().split('T')[0],
                status: 'pending' as 'pending' | 'passed' | 'failed'
            },
            drugTest: {
                completed: false,
                date: new Date().toISOString().split('T')[0],
                status: 'pending' as 'pending' | 'passed' | 'failed'
            }
        },
        certifications: [] as Certification[],
        payRate: {
            hourly: 15,
            overtime: 22.5
        },
        schedule: {
            monday: { start: '07:00', end: '17:00', available: true },
            tuesday: { start: '07:00', end: '17:00', available: true },
            wednesday: { start: '07:00', end: '17:00', available: true },
            thursday: { start: '07:00', end: '17:00', available: true },
            friday: { start: '07:00', end: '17:00', available: true },
            saturday: { start: '08:00', end: '16:00', available: false },
            sunday: { start: '08:00', end: '16:00', available: false }
        },
        performance: {
            rating: 0,
            reviews: [] as PerformanceReview[]
        },
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            hireDate: new Date(formData.hireDate),
            documents: {
                ...formData.documents,
                driversLicense: {
                    ...formData.documents.driversLicense,
                    expiryDate: new Date(formData.documents.driversLicense.expiryDate)
                },
                backgroundCheck: {
                    ...formData.documents.backgroundCheck,
                    date: new Date(formData.documents.backgroundCheck.date)
                },
                drugTest: {
                    ...formData.documents.drugTest,
                    date: new Date(formData.documents.drugTest.date)
                }
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Employee</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.zipCode}
                                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Employment Details */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Type</label>
                                <select
                                    required
                                    value={formData.employeeType}
                                    onChange={(e) => setFormData({ ...formData, employeeType: e.target.value as 'manager' | 'regular' | '1099' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="regular">Regular Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="1099">1099 Contractor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                <select
                                    required
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value as 'driver' | 'helper' | 'supervisor' | 'manager' | 'admin' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="helper">Helper</option>
                                    <option value="driver">Driver</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    required
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on-leave' | 'terminated' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="on-leave">On Leave</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.hireDate}
                                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Portal Credentials */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Portal Credentials (Optional)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={formData.portalCredentials.username}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        portalCredentials: { ...formData.portalCredentials, username: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Portal Email</label>
                                <input
                                    type="email"
                                    value={formData.portalCredentials.email}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        portalCredentials: { ...formData.portalCredentials, email: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={formData.portalCredentials.password}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        portalCredentials: { ...formData.portalCredentials, password: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pay Rate */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Pay Rate</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.payRate.hourly}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        payRate: { ...formData.payRate, hourly: parseFloat(e.target.value) }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Rate ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.payRate.overtime}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        payRate: { ...formData.payRate, overtime: parseFloat(e.target.value) }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Add Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Employee Modal Component
interface EditEmployeeModalProps {
    employee: Employee;
    onClose: () => void;
    onSave: (employee: Employee) => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ employee, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ...employee,
        hireDate: employee.hireDate.toISOString().split('T')[0],
        portalCredentials: employee.portalCredentials || { username: '', email: '', password: '' },
        documents: {
            ...employee.documents,
            driversLicense: {
                ...employee.documents.driversLicense,
                expiryDate: employee.documents.driversLicense.expiryDate.toISOString().split('T')[0]
            },
            backgroundCheck: {
                ...employee.documents.backgroundCheck,
                date: employee.documents.backgroundCheck.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
            },
            drugTest: {
                ...employee.documents.drugTest,
                date: employee.documents.drugTest.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            hireDate: new Date(formData.hireDate),
            documents: {
                ...formData.documents,
                driversLicense: {
                    ...formData.documents.driversLicense,
                    expiryDate: new Date(formData.documents.driversLicense.expiryDate)
                },
                backgroundCheck: {
                    ...formData.documents.backgroundCheck,
                    date: new Date(formData.documents.backgroundCheck.date)
                },
                drugTest: {
                    ...formData.documents.drugTest,
                    date: new Date(formData.documents.drugTest.date)
                }
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Employee</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Employment Details */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Type</label>
                                <select
                                    required
                                    value={formData.employeeType}
                                    onChange={(e) => setFormData({ ...formData, employeeType: e.target.value as 'manager' | 'regular' | '1099' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="regular">Regular Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="1099">1099 Contractor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                <select
                                    required
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value as 'driver' | 'helper' | 'supervisor' | 'manager' | 'admin' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="helper">Helper</option>
                                    <option value="driver">Driver</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    required
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on-leave' | 'terminated' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="on-leave">On Leave</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Portal Credentials */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Portal Credentials</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={formData.portalCredentials?.username || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        portalCredentials: { ...formData.portalCredentials, username: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Portal Email</label>
                                <input
                                    type="email"
                                    value={formData.portalCredentials?.email || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        portalCredentials: { ...formData.portalCredentials, email: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={formData.portalCredentials?.password || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        portalCredentials: { ...formData.portalCredentials, password: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// View Employee Modal Component
interface ViewEmployeeModalProps {
    employee: Employee;
    onClose: () => void;
}

const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({ employee, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Employee Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <p className="text-gray-900">{employee.firstName} {employee.lastName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900">{employee.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-900">{employee.phone}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <p className="text-gray-900">{employee.address}, {employee.city}, {employee.state} {employee.zipCode}</p>
                            </div>
                        </div>
                    </div>

                    {/* Employment Details */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Type</label>
                                <p className="text-gray-900 capitalize">{employee.employeeType === '1099' ? '1099 Contractor' : employee.employeeType}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                <p className="text-gray-900 capitalize">{employee.position}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <p className="text-gray-900 capitalize">{employee.status.replace('-', ' ')}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                                <p className="text-gray-900">{employee.hireDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate</label>
                                <p className="text-gray-900">${employee.payRate.hourly}/hr (${employee.payRate.overtime}/hr OT)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Performance Rating</label>
                                <p className="text-gray-900">{employee.performance.rating}/5</p>
                            </div>
                        </div>
                    </div>

                    {/* Portal Credentials */}
                    {employee.portalCredentials && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Portal Credentials</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <p className="text-gray-900">{employee.portalCredentials.username}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Portal Email</label>
                                    <p className="text-gray-900">{employee.portalCredentials.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Emergency Contact */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <p className="text-gray-900">{employee.emergencyContact.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                <p className="text-gray-900">{employee.emergencyContact.relationship}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-900">{employee.emergencyContact.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeesView;
