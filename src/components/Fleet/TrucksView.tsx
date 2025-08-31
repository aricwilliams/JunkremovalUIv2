import React, { useState, useMemo } from 'react';
import {
    Truck,
    Plus,
    MapPin,
    Wrench,
    Fuel,
    Calendar,
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
    Package,
    Users
} from 'lucide-react';
import { Truck as TruckType, MaintenanceRecord, Employee } from '../../types';

const TrucksView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'trucks' | 'maintenance' | 'drivers'>('overview');
    const [selectedTruck, setSelectedTruck] = useState<TruckType | null>(null);
    const [showAddTruck, setShowAddTruck] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Mock data - in real app this would come from context/API
    const [trucks, setTrucks] = useState<TruckType[]>([
        {
            id: '1',
            name: 'Truck 1',
            licensePlate: 'ABC-123',
            make: 'Ford',
            model: 'F-650',
            year: 2022,
            capacity: {
                weight: 10000,
                volume: 20
            },
            status: 'available',
            currentLocation: {
                latitude: 34.2257,
                longitude: -77.9447
            },
            fuelLevel: 85,
            mileage: 45000,
            lastServiceDate: new Date('2024-01-01'),
            nextServiceDate: new Date('2024-04-01'),
            insurance: {
                policyNumber: 'INS-001',
                expiryDate: new Date('2024-12-31'),
                provider: 'State Farm'
            },
            registration: {
                number: 'REG-001',
                expiryDate: new Date('2024-12-31')
            },
            maintenanceHistory: [],
            notes: 'Primary truck for residential jobs',
            created: new Date('2022-01-01'),
            updated: new Date('2024-01-15')
        },
        {
            id: '2',
            name: 'Truck 2',
            licensePlate: 'XYZ-789',
            make: 'Chevrolet',
            model: 'Silverado 3500',
            year: 2021,
            capacity: {
                weight: 8000,
                volume: 15
            },
            status: 'in-use',
            assignedCrew: 'crew-1',
            assignedJob: 'job-1',
            fuelLevel: 45,
            mileage: 62000,
            lastServiceDate: new Date('2023-12-15'),
            nextServiceDate: new Date('2024-03-15'),
            insurance: {
                policyNumber: 'INS-002',
                expiryDate: new Date('2024-12-31'),
                provider: 'Allstate'
            },
            registration: {
                number: 'REG-002',
                expiryDate: new Date('2024-12-31')
            },
            maintenanceHistory: [
                {
                    id: 'maint-1',
                    truckId: '2',
                    date: new Date('2023-12-15'),
                    type: 'routine',
                    description: 'Oil change, tire rotation, brake inspection',
                    cost: 350,
                    mileage: 60000,
                    performedBy: 'emp-1',
                    nextServiceMileage: 66000,
                    nextServiceDate: new Date('2024-03-15'),
                    receipts: []
                }
            ],
            notes: 'Commercial jobs truck',
            created: new Date('2021-06-01'),
            updated: new Date('2024-01-20')
        },
        {
            id: '3',
            name: 'Truck 3',
            licensePlate: 'DEF-456',
            make: 'Dodge',
            model: 'Ram 3500',
            year: 2020,
            capacity: {
                weight: 12000,
                volume: 25
            },
            status: 'maintenance',
            fuelLevel: 20,
            mileage: 78000,
            lastServiceDate: new Date('2023-11-01'),
            nextServiceDate: new Date('2024-02-01'),
            insurance: {
                policyNumber: 'INS-003',
                expiryDate: new Date('2024-12-31'),
                provider: 'Progressive'
            },
            registration: {
                number: 'REG-003',
                expiryDate: new Date('2024-12-31')
            },
            maintenanceHistory: [
                {
                    id: 'maint-2',
                    truckId: '3',
                    date: new Date('2024-01-15'),
                    type: 'repair',
                    description: 'Transmission repair and clutch replacement',
                    cost: 2800,
                    mileage: 78000,
                    performedBy: 'emp-2',
                    receipts: []
                }
            ],
            notes: 'Heavy-duty truck for large jobs',
            created: new Date('2020-03-01'),
            updated: new Date('2024-01-15')
        }
    ]);

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
            position: 'driver',
            status: 'active',
            hireDate: new Date('2022-01-01'),
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
            certifications: [],
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
                reviews: []
            },
            notes: 'Experienced driver, excellent safety record',
            created: new Date('2022-01-01'),
            updated: new Date('2024-01-15')
        }
    ]);

    // Calculate statistics
    const stats = useMemo(() => {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        return {
            totalTrucks: trucks.length,
            availableTrucks: trucks.filter(t => t.status === 'available').length,
            inUseTrucks: trucks.filter(t => t.status === 'in-use').length,
            maintenanceTrucks: trucks.filter(t => t.status === 'maintenance').length,
            outOfServiceTrucks: trucks.filter(t => t.status === 'out-of-service').length,
            upcomingServices: trucks.filter(t => t.nextServiceDate <= thirtyDaysFromNow).length,
            lowFuelTrucks: trucks.filter(t => t.fuelLevel < 25).length,
            totalMileage: trucks.reduce((sum, t) => sum + t.mileage, 0),
            averageFuelLevel: trucks.reduce((sum, t) => sum + t.fuelLevel, 0) / trucks.length
        };
    }, [trucks]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'in-use': return 'bg-blue-100 text-blue-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'out-of-service': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available': return <CheckCircle className="w-4 h-4" />;
            case 'in-use': return <Clock className="w-4 h-4" />;
            case 'maintenance': return <Wrench className="w-4 h-4" />;
            case 'out-of-service': return <XCircle className="w-4 h-4" />;
            default: return <Truck className="w-4 h-4" />;
        }
    };

    const getFuelColor = (level: number) => {
        if (level < 25) return 'text-red-600';
        if (level < 50) return 'text-yellow-600';
        return 'text-green-600';
    };

    const filteredTrucks = trucks.filter(truck =>
        statusFilter === 'all' || truck.status === statusFilter
    );

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fleet Management</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage trucks, maintenance, and drivers</p>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                        onClick={() => setShowAddTruck(true)}
                        className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Truck</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Trucks</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalTrucks}</p>
                        </div>
                        <Truck className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Available</p>
                            <p className="text-2xl font-bold text-green-600">{stats.availableTrucks}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">In Use</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.inUseTrucks}</p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Maintenance</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.maintenanceTrucks}</p>
                        </div>
                        <Wrench className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Upcoming Services</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.upcomingServices}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Low Fuel</p>
                            <p className="text-2xl font-bold text-red-600">{stats.lowFuelTrucks}</p>
                        </div>
                        <Fuel className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Mileage</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.totalMileage.toLocaleString()}</p>
                        </div>
                        <MapPin className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Fuel Level</p>
                            <p className="text-2xl font-bold text-indigo-600">{Math.round(stats.averageFuelLevel)}%</p>
                        </div>
                        <Fuel className="w-8 h-8 text-indigo-500" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex flex-wrap -mb-px">
                        {[
                            { id: 'overview', label: 'Overview', icon: Truck },
                            { id: 'trucks', label: 'Trucks', icon: Truck },
                            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
                            { id: 'drivers', label: 'Drivers', icon: Users }
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
                                {/* Fleet Status */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Status</h3>
                                    <div className="space-y-3">
                                        {['available', 'in-use', 'maintenance', 'out-of-service'].map((status) => {
                                            const count = trucks.filter(t => t.status === status).length;
                                            const percentage = (count / trucks.length) * 100;
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

                                {/* Alerts */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
                                    <div className="space-y-3">
                                        {stats.upcomingServices > 0 && (
                                            <div className="flex items-center space-x-2 text-yellow-700">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>{stats.upcomingServices} trucks need service soon</span>
                                            </div>
                                        )}
                                        {stats.lowFuelTrucks > 0 && (
                                            <div className="flex items-center space-x-2 text-red-700">
                                                <Fuel className="w-4 h-4" />
                                                <span>{stats.lowFuelTrucks} trucks have low fuel</span>
                                            </div>
                                        )}
                                        {trucks.filter(t => t.insurance.expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length > 0 && (
                                            <div className="flex items-center space-x-2 text-orange-700">
                                                <Calendar className="w-4 h-4" />
                                                <span>Insurance expiring soon</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trucks Tab */}
                    {activeTab === 'trucks' && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <h2 className="text-lg font-semibold text-gray-900">All Trucks</h2>
                                <div className="flex space-x-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="available">Available</option>
                                        <option value="in-use">In Use</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="out-of-service">Out of Service</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {filteredTrucks.map((truck) => (
                                    <div key={truck.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{truck.name}</h3>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(truck.status)}`}>
                                                        {getStatusIcon(truck.status)}
                                                        <span className="ml-1 capitalize">{truck.status.replace('-', ' ')}</span>
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <span>{truck.make} {truck.model} ({truck.year})</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Package className="w-4 h-4" />
                                                        <span>{truck.capacity.weight} lbs, {truck.capacity.volume} yds³</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Fuel className={`w-4 h-4 ${getFuelColor(truck.fuelLevel)}`} />
                                                        <span className={getFuelColor(truck.fuelLevel)}>{truck.fuelLevel}% fuel</span>
                                                    </div>
                                                </div>

                                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                                    <div>License: {truck.licensePlate}</div>
                                                    <div>Mileage: {truck.mileage.toLocaleString()}</div>
                                                    <div>Next Service: {truck.nextServiceDate.toLocaleDateString()}</div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <div className="flex space-x-1">
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <Wrench className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Maintenance Records</h2>
                                <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    <span>Add Record</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {trucks.flatMap(truck =>
                                    truck.maintenanceHistory.map(record => (
                                        <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="font-semibold text-gray-900">{truck.name}</h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.type === 'routine' ? 'bg-green-100 text-green-800' :
                                                                record.type === 'repair' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                            }`}>
                                                            {record.type.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <div>{record.description}</div>
                                                        <div>Date: {record.date.toLocaleDateString()}</div>
                                                        <div>Mileage: {record.mileage.toLocaleString()}</div>
                                                        <div>Cost: ${record.cost.toLocaleString()}</div>
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

                    {/* Drivers Tab */}
                    {activeTab === 'drivers' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Drivers</h2>
                                <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    <span>Add Driver</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {employees.filter(emp => emp.position === 'driver').map((driver) => (
                                    <div key={driver.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{driver.firstName} {driver.lastName}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${driver.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            driver.status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {driver.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <div>{driver.email} • {driver.phone}</div>
                                                    <div>License: {driver.documents.driversLicense.number} (expires {driver.documents.driversLicense.expiryDate.toLocaleDateString()})</div>
                                                    <div>Pay Rate: ${driver.payRate.hourly}/hr (${driver.payRate.overtime}/hr OT)</div>
                                                    <div>Rating: {driver.performance.rating}/5</div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrucksView;
