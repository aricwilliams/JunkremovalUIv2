import React, { useState, useMemo } from 'react';
import {
    Building,
    Plus,
    Calendar,
    FileText,
    Download,
    Eye,
    Clock,
    CheckCircle,
    AlertTriangle,
    MapPin,
    DollarSign,
    Package,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Search,
    Filter,
    Upload,
    Send,
    Star,
    Phone,
    Mail,
    MessageSquare,
    Edit,
    X,
    UserPlus,
    Key,
    Camera,
    Video,
    AlertCircle,
    Info,
    CheckSquare,
    Square,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { PortalUser, PortalRequest, PortalReport, Job, Invoice, Customer } from '../../types';

const ClientPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'history' | 'clients' | 'invoices' | 'reports' | 'profile'>('dashboard');
    const [showNewRequest, setShowNewRequest] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<PortalRequest | null>(null);
    const [showAddClient, setShowAddClient] = useState(false);
    const [showEditClient, setShowEditClient] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
    const [requestFormData, setRequestFormData] = useState({
        // Client Selection
        isNewClient: true,
        selectedClientId: '',

        // Basic Contact Info
        fullName: '',
        phone: '',
        email: '',
        textOptIn: false,
        serviceAddress: '',
        gateCode: '',
        apartmentNumber: '',

        // Project Details
        preferredDate: '',
        preferredTime: '',
        locationOnProperty: '',
        accessConsiderations: '',
        approximateVolume: '',

        // Photos & Media
        photos: [] as File[],
        videos: [] as File[],

        // Item Type & Condition
        materialTypes: [] as string[],
        filledWithWater: false,
        filledWithOil: false,
        hazardousMaterial: false,
        hazardousDescription: '',
        itemsInBags: false,
        bagContents: '',
        oversizedItems: false,
        oversizedDescription: '',
        approximateItemCount: '',

        // Safety & Hazards
        hasMold: false,
        hasPests: false,
        hasSharpObjects: false,
        heavyLiftingRequired: false,
        disassemblyRequired: false,
        disassemblyDescription: '',

        // Customer Notes
        additionalNotes: '',
        requestDonationPickup: false,
        requestDemolition: false,
        demolitionDescription: '',

        // Follow-up
        howDidYouHear: '',
        understandPricing: false,
        priority: 'standard' as 'standard' | 'urgent'
    });

    // Mock data - in real app this would come from context/API
    const [portalUser] = useState<PortalUser>({
        id: 'user-1',
        customerId: 'cust-1',
        username: 'admin@downtownoffice.com',
        email: 'admin@downtownoffice.com',
        role: 'owner',
        permissions: ['view_jobs', 'create_requests', 'view_invoices', 'download_reports'],
        lastLogin: new Date(),
        isActive: true,
        created: new Date('2023-01-01')
    });

    const [customer] = useState<Customer>({
        id: 'cust-1',
        name: 'Downtown Office Complex',
        email: 'admin@downtownoffice.com',
        phone: '555-0100',
        address: '321 Commerce St',
        city: 'Wilmington',
        state: 'NC',
        zipCode: '28401',
        created: new Date('2023-01-01'),
        status: 'completed',
        tags: ['commercial', 'recurring'],
        notes: 'Large office complex with regular waste management needs',
        isCommercial: true,
        portalAccess: true,
        paymentTerms: 'net30'
    });

    // Mock data for clients list
    const [clients, setClients] = useState<Customer[]>([
        {
            id: 'cust-1',
            name: 'Downtown Office Complex',
            email: 'admin@downtownoffice.com',
            phone: '555-0100',
            address: '321 Commerce St',
            city: 'Wilmington',
            state: 'NC',
            zipCode: '28401',
            created: new Date('2023-01-01'),
            status: 'active',
            tags: ['commercial', 'recurring'],
            notes: 'Large office complex with regular waste management needs',
            isCommercial: true,
            portalAccess: true,
            paymentTerms: 'net30',
            portalCredentials: {
                username: 'downtown_admin',
                email: 'admin@downtownoffice.com',
                password: 'securepass123'
            }
        },
        {
            id: 'cust-2',
            name: 'Riverside Apartments',
            email: 'manager@riversideapts.com',
            phone: '555-0200',
            address: '456 River Rd',
            city: 'Wilmington',
            state: 'NC',
            zipCode: '28403',
            created: new Date('2023-02-15'),
            status: 'active',
            tags: ['residential', 'multi-unit'],
            notes: 'Apartment complex with regular maintenance needs',
            isCommercial: true,
            portalAccess: true,
            paymentTerms: 'net30',
            portalCredentials: {
                username: 'riverside_manager',
                email: 'manager@riversideapts.com',
                password: 'aptpass456'
            }
        },
        {
            id: 'cust-3',
            name: 'Coastal Retail Center',
            email: 'operations@coastalretail.com',
            phone: '555-0300',
            address: '789 Beach Blvd',
            city: 'Wilmington',
            state: 'NC',
            zipCode: '28405',
            created: new Date('2023-03-10'),
            status: 'active',
            tags: ['commercial', 'retail'],
            notes: 'Shopping center with multiple tenants',
            isCommercial: true,
            portalAccess: true,
            paymentTerms: 'net30',
            portalCredentials: {
                username: 'coastal_ops',
                email: 'operations@coastalretail.com',
                password: 'retailpass789'
            }
        }
    ]);

    const [requests, setRequests] = useState<PortalRequest[]>([
        {
            id: 'req-1',
            customerId: 'cust-1',
            customerName: 'Downtown Office Complex',
            type: 'pickup',
            priority: 'medium',
            status: 'completed',
            subject: 'Weekly Office Waste Pickup',
            description: 'Regular weekly pickup of office waste and recycling from all floors',
            requestedDate: new Date('2024-01-15'),
            preferredDate: new Date('2024-01-16'),
            preferredTime: '09:00 AM',
            location: {
                address: '321 Commerce St',
                city: 'Wilmington',
                state: 'NC',
                zipCode: '28401'
            },
            volume: {
                weight: 800,
                yardage: 12
            },
            attachments: [],
            notes: 'Please access through loading dock on the east side',
            created: new Date('2024-01-15'),
            updated: new Date('2024-01-16')
        },
        {
            id: 'req-2',
            customerId: 'cust-1',
            customerName: 'Downtown Office Complex',
            type: 'service',
            priority: 'high',
            status: 'in-progress',
            subject: 'Emergency Cleanup - Conference Room Renovation',
            description: 'Need immediate cleanup of construction debris from conference room renovation project',
            requestedDate: new Date('2024-01-20'),
            preferredDate: new Date('2024-01-21'),
            preferredTime: 'ASAP',
            location: {
                address: '321 Commerce St',
                city: 'Wilmington',
                state: 'NC',
                zipCode: '28401'
            },
            volume: {
                weight: 1200,
                yardage: 18
            },
            attachments: [],
            notes: 'Construction materials include drywall, wood, and metal scraps',
            created: new Date('2024-01-20'),
            updated: new Date('2024-01-20')
        }
    ]);

    const [jobs, setJobs] = useState<Job[]>([
        {
            id: 'job-1',
            customerId: 'cust-1',
            customerName: 'Downtown Office Complex',
            customerPhone: '555-0100',
            customerEmail: 'admin@downtownoffice.com',
            address: '321 Commerce St',
            city: 'Wilmington',
            state: 'NC',
            zipCode: '28401',
            scheduledDate: new Date('2024-01-16'),
            timeSlot: '09:00 AM',
            estimatedHours: 3,
            items: [
                {
                    id: 'item-1',
                    name: 'Office Waste',
                    category: 'General Waste',
                    quantity: 1,
                    basePrice: 150,
                    difficulty: 'easy',
                    estimatedTime: 2
                },
                {
                    id: 'item-2',
                    name: 'Recycling',
                    category: 'Recycling',
                    quantity: 1,
                    basePrice: 75,
                    difficulty: 'easy',
                    estimatedTime: 1
                }
            ],
            status: 'completed',
            totalEstimate: 225,
            actualTotal: 225,
            notes: 'Completed successfully, all waste properly sorted',
            beforePhotos: ['/api/photos/job-1-before-1.jpg'],
            afterPhotos: ['/api/photos/job-1-after-1.jpg'],
            created: new Date('2024-01-15'),
            updated: new Date('2024-01-16'),
            volume: {
                weight: 800,
                yardage: 12
            }
        }
    ]);

    const [invoices, setInvoices] = useState<Invoice[]>([
        {
            id: 'inv-1',
            customerId: 'cust-1',
            customerName: 'Downtown Office Complex',
            customerEmail: 'admin@downtownoffice.com',
            jobId: 'job-1',
            items: [
                {
                    id: 'inv-item-1',
                    name: 'Weekly Office Waste Pickup',
                    description: 'Complete waste removal and recycling service',
                    quantity: 1,
                    unitPrice: 225,
                    total: 225
                }
            ],
            subtotal: 225,
            tax: 0,
            total: 225,
            status: 'paid',
            dueDate: new Date('2024-02-15'),
            sentDate: new Date('2024-01-16'),
            paidDate: new Date('2024-01-25'),
            paymentTerms: 'net30',
            notes: 'Payment received on time',
            created: new Date('2024-01-16'),
            updated: new Date('2024-01-25')
        }
    ]);

    const [reports, setReports] = useState<PortalReport[]>([
        {
            id: 'report-1',
            customerId: 'cust-1',
            type: 'monthly',
            period: {
                start: new Date('2024-01-01'),
                end: new Date('2024-01-31')
            },
            data: {
                totalJobs: 4,
                totalVolume: {
                    weight: 3200,
                    yardage: 48
                },
                totalSpent: 900,
                averageJobValue: 225,
                jobsByMonth: [
                    {
                        month: 'January 2024',
                        jobs: 4,
                        revenue: 900,
                        volume: {
                            weight: 3200,
                            yardage: 48
                        }
                    }
                ]
            },
            generatedDate: new Date('2024-02-01'),
            downloadUrl: '/api/reports/report-1.pdf'
        }
    ]);

    // Calculate statistics
    const stats = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return {
            totalRequests: requests.length,
            pendingRequests: requests.filter(r => r.status === 'pending').length,
            completedRequests: requests.filter(r => r.status === 'completed').length,
            totalJobs: jobs.length,
            completedJobs: jobs.filter(j => j.status === 'completed').length,
            totalSpent: invoices.reduce((sum, inv) => sum + inv.total, 0),
            totalVolume: jobs.reduce((sum, job) => sum + job.volume.weight, 0),
            averageJobValue: jobs.length > 0 ? jobs.reduce((sum, job) => sum + job.totalEstimate, 0) / jobs.length : 0,
            recentActivity: requests.filter(r => r.created >= thirtyDaysAgo).length
        };
    }, [requests, jobs, invoices]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'in-progress': return <AlertTriangle className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCreateRequest = (request: PortalRequest) => {
        setRequests(prev => [...prev, request]);
        setShowNewRequest(false);
    };

    const handleFileUpload = (files: FileList, type: 'photos' | 'videos') => {
        const fileArray = Array.from(files);
        setRequestFormData(prev => ({
            ...prev,
            [type]: [...prev[type], ...fileArray]
        }));
    };

    const removeFile = (index: number, type: 'photos' | 'videos') => {
        setRequestFormData(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    const handleMaterialTypeToggle = (materialType: string) => {
        setRequestFormData(prev => ({
            ...prev,
            materialTypes: prev.materialTypes.includes(materialType)
                ? prev.materialTypes.filter(type => type !== materialType)
                : [...prev.materialTypes, materialType]
        }));
    };

    const handleClientSelection = (isNewClient: boolean, clientId?: string) => {
        if (isNewClient) {
            setRequestFormData(prev => ({
                ...prev,
                isNewClient: true,
                selectedClientId: '',
                fullName: '',
                phone: '',
                email: '',
                serviceAddress: '',
                gateCode: '',
                apartmentNumber: ''
            }));
        } else {
            const selectedClient = clients.find(c => c.id === clientId);
            if (selectedClient) {
                setRequestFormData(prev => ({
                    ...prev,
                    isNewClient: false,
                    selectedClientId: selectedClient.id,
                    fullName: selectedClient.name,
                    phone: selectedClient.phone,
                    email: selectedClient.email,
                    serviceAddress: selectedClient.address,
                    gateCode: '',
                    apartmentNumber: ''
                }));
            } else {
                // If no client ID provided, just toggle the checkbox
                setRequestFormData(prev => ({
                    ...prev,
                    isNewClient: false,
                    selectedClientId: ''
                }));
            }
        }
    };

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form based on client type
        if (!requestFormData.isNewClient && !requestFormData.selectedClientId) {
            alert('Please select an existing client');
            return;
        }

        if (requestFormData.isNewClient && (!requestFormData.fullName || !requestFormData.phone || !requestFormData.email || !requestFormData.serviceAddress)) {
            alert('Please fill in all required fields for new client');
            return;
        }

        // Create a new request with the form data
        const newRequest: PortalRequest = {
            id: `req-${Date.now()}`,
            customerId: requestFormData.isNewClient ? `new-${Date.now()}` : requestFormData.selectedClientId,
            customerName: requestFormData.isNewClient ? requestFormData.fullName : clients.find(c => c.id === requestFormData.selectedClientId)?.name || 'Unknown Client',
            type: 'pickup',
            priority: requestFormData.priority,
            status: 'pending',
            subject: `Junk Removal Request - ${requestFormData.isNewClient ? requestFormData.fullName : clients.find(c => c.id === requestFormData.selectedClientId)?.name || 'Unknown Client'}`,
            description: `Request from ${requestFormData.isNewClient ? requestFormData.fullName : clients.find(c => c.id === requestFormData.selectedClientId)?.name || 'Unknown Client'} for junk removal service.`,
            requestedDate: new Date(),
            preferredDate: requestFormData.preferredDate ? new Date(requestFormData.preferredDate) : new Date(),
            preferredTime: requestFormData.preferredTime || 'Flexible',
            location: {
                address: requestFormData.serviceAddress || clients.find(c => c.id === requestFormData.selectedClientId)?.address || '',
                city: requestFormData.isNewClient ? 'TBD' : clients.find(c => c.id === requestFormData.selectedClientId)?.city || 'TBD',
                state: requestFormData.isNewClient ? 'TBD' : clients.find(c => c.id === requestFormData.selectedClientId)?.state || 'TBD',
                zipCode: requestFormData.isNewClient ? 'TBD' : clients.find(c => c.id === requestFormData.selectedClientId)?.zipCode || 'TBD'
            },
            volume: {
                weight: 0, // Will be determined after review
                yardage: 0
            },
            attachments: [], // Photos and videos would be handled separately in real app
            notes: `Contact: ${requestFormData.isNewClient ? requestFormData.fullName : clients.find(c => c.id === requestFormData.selectedClientId)?.name || 'Unknown Client'} | Phone: ${requestFormData.phone || clients.find(c => c.id === requestFormData.selectedClientId)?.phone || 'N/A'} | Email: ${requestFormData.email || clients.find(c => c.id === requestFormData.selectedClientId)?.email || 'N/A'}
                    Location on Property: ${requestFormData.locationOnProperty}
                    Access Considerations: ${requestFormData.accessConsiderations}
                    Approximate Volume: ${requestFormData.approximateVolume}
                    Material Types: ${requestFormData.materialTypes.join(', ')}
                    Special Conditions: ${[
                    requestFormData.filledWithWater && 'Filled with water',
                    requestFormData.filledWithOil && 'Filled with oil/fuel',
                    requestFormData.hazardousMaterial && `Hazardous materials: ${requestFormData.hazardousDescription}`,
                    requestFormData.itemsInBags && `Items in bags: ${requestFormData.bagContents}`,
                    requestFormData.oversizedItems && `Oversized items: ${requestFormData.oversizedDescription}`,
                    requestFormData.hasMold && 'Mold present',
                    requestFormData.hasPests && 'Pests present',
                    requestFormData.hasSharpObjects && 'Sharp objects present',
                    requestFormData.heavyLiftingRequired && 'Heavy lifting required',
                    requestFormData.disassemblyRequired && `Disassembly required: ${requestFormData.disassemblyDescription}`,
                    requestFormData.requestDonationPickup && 'Donation pickup requested',
                    requestFormData.requestDemolition && `Demolition requested: ${requestFormData.demolitionDescription}`
                ].filter(Boolean).join(', ')}
                    Additional Notes: ${requestFormData.additionalNotes}
                    How did you hear about us: ${requestFormData.howDidYouHear}
                    Priority: ${requestFormData.priority}`,
            created: new Date(),
            updated: new Date()
        };

        setRequests(prev => [...prev, newRequest]);
        setShowNewRequest(false);
        // Reset form data
        setRequestFormData({
            isNewClient: true,
            selectedClientId: '',
            fullName: '',
            phone: '',
            email: '',
            textOptIn: false,
            serviceAddress: '',
            gateCode: '',
            apartmentNumber: '',
            preferredDate: '',
            preferredTime: '',
            locationOnProperty: '',
            accessConsiderations: '',
            approximateVolume: '',
            photos: [],
            videos: [],
            materialTypes: [],
            filledWithWater: false,
            filledWithOil: false,
            hazardousMaterial: false,
            hazardousDescription: '',
            itemsInBags: false,
            bagContents: '',
            oversizedItems: false,
            oversizedDescription: '',
            approximateItemCount: '',
            hasMold: false,
            hasPests: false,
            hasSharpObjects: false,
            heavyLiftingRequired: false,
            disassemblyRequired: false,
            disassemblyDescription: '',
            additionalNotes: '',
            requestDonationPickup: false,
            requestDemolition: false,
            demolitionDescription: '',
            howDidYouHear: '',
            understandPricing: false,
            priority: 'standard'
        });
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Client Portal</h1>
                    <p className="text-sm sm:text-base text-gray-600">Welcome back, {customer.name}</p>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                        onClick={() => setShowNewRequest(true)}
                        className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Request</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Completed Jobs</p>
                            <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Spent</p>
                            <p className="text-2xl font-bold text-purple-600">${stats.totalSpent}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Volume</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.totalVolume} lbs</p>
                        </div>
                        <Package className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex flex-wrap -mb-px">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                            { id: 'requests', label: 'Requests', icon: FileText },
                            { id: 'history', label: 'Job History', icon: Calendar },
                            { id: 'clients', label: 'Clients', icon: Users },
                            { id: 'invoices', label: 'Invoices', icon: DollarSign },
                            { id: 'reports', label: 'Reports', icon: Download },
                            { id: 'profile', label: 'Profile', icon: Settings }
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
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Activity */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                    <div className="space-y-3">
                                        {requests.slice(0, 5).map((request) => (
                                            <div key={request.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                                                <div className={`p-2 rounded-full ${getStatusColor(request.status)}`}>
                                                    {getStatusIcon(request.status)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{request.subject}</p>
                                                    <p className="text-sm text-gray-600">{request.created.toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                    {request.priority}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Average Job Value</span>
                                            <span className="font-semibold">${stats.averageJobValue.toFixed(0)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Pending Requests</span>
                                            <span className="font-semibold text-yellow-600">{stats.pendingRequests}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Recent Activity (30 days)</span>
                                            <span className="font-semibold text-blue-600">{stats.recentActivity}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="font-medium">Call Us</p>
                                            <p className="text-sm text-gray-600">555-123-4567</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="font-medium">Email Support</p>
                                            <p className="text-sm text-gray-600">support@company.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MessageSquare className="w-5 h-5 text-purple-500" />
                                        <div>
                                            <p className="font-medium">Live Chat</p>
                                            <p className="text-sm text-gray-600">Available 24/7</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <h2 className="text-lg font-semibold text-gray-900">Service Requests</h2>
                                <div className="flex space-x-2">
                                    <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {requests.map((request) => (
                                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{request.subject}</h3>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                        {getStatusIcon(request.status)}
                                                        <span className="ml-1 capitalize">{request.status.replace('-', ' ')}</span>
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                        {request.priority}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Requested: {request.requestedDate.toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{request.location.address}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Package className="w-4 h-4" />
                                                        <span>{request.volume?.weight} lbs, {request.volume?.yardage} yds³</span>
                                                    </div>
                                                </div>

                                                <p className="mt-2 text-sm text-gray-600">{request.description}</p>
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <div className="flex space-x-1">
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <MessageSquare className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Job History Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Job History</h2>
                                <div className="flex space-x-2">
                                    <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                                        <option value="all">All Jobs</option>
                                        <option value="completed">Completed</option>
                                        <option value="scheduled">Scheduled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {jobs.map((job) => (
                                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">Job #{job.id}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        job.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {job.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <div>Date: {job.scheduledDate.toLocaleDateString()} at {job.timeSlot}</div>
                                                    <div>Address: {job.address}, {job.city}, {job.state}</div>
                                                    <div>Total: ${job.totalEstimate}</div>
                                                    <div>Volume: {job.volume.weight} lbs, {job.volume.yardage} yds³</div>
                                                </div>
                                                {job.notes && (
                                                    <p className="mt-2 text-sm text-gray-600">Notes: {job.notes}</p>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clients Tab */}
                    {activeTab === 'clients' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Client Management</h2>
                                <button
                                    onClick={() => setShowAddClient(true)}
                                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Add Client</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {clients.map((client) => (
                                    <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {client.status.toUpperCase()}
                                                    </span>
                                                    {client.portalAccess && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            PORTAL ACCESS
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{client.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{client.phone}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{client.address}, {client.city}, {client.state}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Key className="w-4 h-4" />
                                                        <span>Payment: {client.paymentTerms.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                                {client.portalCredentials && (
                                                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                        <div className="font-medium text-gray-700 mb-1">Portal Credentials:</div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                                                            <div><span className="font-medium">Username:</span> {client.portalCredentials.username}</div>
                                                            <div><span className="font-medium">Email:</span> {client.portalCredentials.email}</div>
                                                            <div><span className="font-medium">Password:</span> ••••••••••</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {client.notes && (
                                                    <p className="mt-2 text-sm text-gray-600">Notes: {client.notes}</p>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedClient(client);
                                                        setShowEditClient(true);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
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

                    {/* Invoices Tab */}
                    {activeTab === 'invoices' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
                                <div className="flex space-x-2">
                                    <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                                        <option value="all">All Status</option>
                                        <option value="paid">Paid</option>
                                        <option value="sent">Sent</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {invoices.map((invoice) => (
                                    <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">Invoice #{invoice.id}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {invoice.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <div>Amount: ${invoice.total}</div>
                                                    <div>Due Date: {invoice.dueDate.toLocaleDateString()}</div>
                                                    <div>Terms: {invoice.paymentTerms.toUpperCase()}</div>
                                                    {invoice.paidDate && (
                                                        <div>Paid: {invoice.paidDate.toLocaleDateString()}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === 'reports' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
                                <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    <span>Generate Report</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {reports.map((report) => (
                                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">
                                                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                                                </h3>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <div>Period: {report.period.start.toLocaleDateString()} - {report.period.end.toLocaleDateString()}</div>
                                                    <div>Jobs: {report.data.totalJobs}</div>
                                                    <div>Total Spent: ${report.data.totalSpent}</div>
                                                    <div>Volume: {report.data.totalVolume.weight} lbs, {report.data.totalVolume.yardage} yds³</div>
                                                    <div>Generated: {report.generatedDate.toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                        <p className="mt-1 text-sm text-gray-900">{customer.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <p className="mt-1 text-sm text-gray-900">{customer.phone}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                                        <p className="mt-1 text-sm text-gray-900">{customer.paymentTerms.toUpperCase()}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {customer.address}, {customer.city}, {customer.state} {customer.zipCode}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portal Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Username</label>
                                        <p className="mt-1 text-sm text-gray-900">{portalUser.username}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Role</label>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">{portalUser.role}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Login</label>
                                        <p className="mt-1 text-sm text-gray-900">{portalUser.lastLogin?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Request Modal */}
            {showNewRequest && (
                <NewRequestModal
                    onClose={() => setShowNewRequest(false)}
                    onSubmit={handleSubmitRequest}
                    formData={requestFormData}
                    setFormData={setRequestFormData}
                    handleFileUpload={handleFileUpload}
                    removeFile={removeFile}
                    handleMaterialTypeToggle={handleMaterialTypeToggle}
                    clients={clients}
                    handleClientSelection={handleClientSelection}
                />
            )}

            {/* Add Client Modal */}
            {showAddClient && (
                <AddClientModal
                    onClose={() => setShowAddClient(false)}
                    onSave={(client) => {
                        setClients([...clients, { ...client, id: `cust-${Date.now()}`, created: new Date() }]);
                        setShowAddClient(false);
                    }}
                />
            )}

            {/* Edit Client Modal */}
            {showEditClient && selectedClient && (
                <EditClientModal
                    client={selectedClient}
                    onClose={() => {
                        setShowEditClient(false);
                        setSelectedClient(null);
                    }}
                    onSave={(updatedClient) => {
                        setClients(clients.map(client => client.id === updatedClient.id ? updatedClient : client));
                        setShowEditClient(false);
                        setSelectedClient(null);
                    }}
                />
            )}
        </div>
    );
};

// New Request Modal Component
interface NewRequestModalProps {
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: any;
    setFormData: (data: any) => void;
    handleFileUpload: (files: FileList, type: 'photos' | 'videos') => void;
    removeFile: (index: number, type: 'photos' | 'videos') => void;
    handleMaterialTypeToggle: (materialType: string) => void;
    clients: Customer[];
    handleClientSelection: (isNewClient: boolean, clientId?: string) => void;
}

const NewRequestModal: React.FC<NewRequestModalProps> = ({
    onClose,
    onSubmit,
    formData,
    setFormData,
    handleFileUpload,
    removeFile,
    handleMaterialTypeToggle,
    clients,
    handleClientSelection
}) => {
    const materialTypeOptions = [
        'Wood', 'Metal', 'Electronics', 'Furniture', 'Appliances',
        'Yard Debris', 'Construction Waste', 'Clothing', 'Books', 'Mixed'
    ];

    const volumeOptions = [
        'Small Load (1-2 items)', 'Half Truck', 'Full Truck', 'Multiple Trucks', 'Unsure'
    ];

    const locationOptions = [
        'Curbside', 'Inside House', 'Garage', 'Upstairs', 'Backyard', 'Basement', 'Attic', 'Mixed'
    ];

    const howDidYouHearOptions = [
        'Google Search', 'Facebook', 'Referral', 'Repeat Customer', 'Yelp', 'Other'
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">New Junk Removal Request</h2>
                        <p className="text-sm text-gray-600 mt-1">Tell us about your junk removal project for a custom quote</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-8">
                    {/* Client Selection */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Client Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isNewClient}
                                        onChange={() => {
                                            if (!formData.isNewClient) {
                                                handleClientSelection(true);
                                            }
                                        }}
                                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">New Client</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={!formData.isNewClient}
                                        onChange={() => {
                                            if (formData.isNewClient) {
                                                handleClientSelection(false);
                                            }
                                        }}
                                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Existing Client</span>
                                </label>
                            </div>

                            {!formData.isNewClient && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Existing Client</label>
                                    <select
                                        value={formData.selectedClientId}
                                        onChange={(e) => handleClientSelection(false, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required={!formData.isNewClient}
                                    >
                                        <option value="">Choose a client...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} - {client.email}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Client contact information and address will be automatically filled from our records. These fields are read-only when existing client is selected.
                                    </p>
                                    {formData.selectedClientId && (
                                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                            <p className="text-xs text-blue-700 flex items-center">
                                                <Info className="w-3 h-3 mr-1" />
                                                <strong>{clients.find(c => c.id === formData.selectedClientId)?.name}</strong> selected. Client information populated (read-only).
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Contact Info */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <UserPlus className="w-5 h-5 mr-2" />
                            Basic Contact Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                    {!formData.isNewClient && formData.selectedClientId && (
                                        <span className="ml-1 text-xs text-blue-600">(from client record)</span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    required={formData.isNewClient || !formData.selectedClientId}
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.isNewClient && formData.selectedClientId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!formData.isNewClient && formData.selectedClientId}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                    {!formData.isNewClient && formData.selectedClientId && (
                                        <span className="ml-1 text-xs text-blue-600">(from client record)</span>
                                    )}
                                </label>
                                <input
                                    type="tel"
                                    required={formData.isNewClient || !formData.selectedClientId}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.isNewClient && formData.selectedClientId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!formData.isNewClient && formData.selectedClientId}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                    {!formData.isNewClient && formData.selectedClientId && (
                                        <span className="ml-1 text-xs text-blue-600">(from client record)</span>
                                    )}
                                </label>
                                <input
                                    type="email"
                                    required={formData.isNewClient || !formData.selectedClientId}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.isNewClient && formData.selectedClientId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!formData.isNewClient && formData.selectedClientId}
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.textOptIn}
                                    onChange={(e) => setFormData({ ...formData, textOptIn: e.target.checked })}
                                    className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!formData.isNewClient && formData.selectedClientId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={!formData.isNewClient && formData.selectedClientId}
                                />
                                <span className={`ml-2 text-sm ${!formData.isNewClient && formData.selectedClientId ? 'text-gray-500' : 'text-gray-700'}`}>OK to text me updates</span>
                            </div>
                        </div>
                    </div>

                    {/* Service Address */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            Service Address
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Address *
                                    {!formData.isNewClient && formData.selectedClientId && (
                                        <span className="ml-1 text-xs text-blue-600">(from client record)</span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    required={formData.isNewClient || !formData.selectedClientId}
                                    value={formData.serviceAddress}
                                    onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.isNewClient && formData.selectedClientId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    placeholder="Street address where junk removal will occur"
                                    disabled={!formData.isNewClient && formData.selectedClientId}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gate Code (if applicable)</label>
                                <input
                                    type="text"
                                    value={formData.gateCode}
                                    onChange={(e) => setFormData({ ...formData, gateCode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Gate code for access"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Unit Number</label>
                                <input
                                    type="text"
                                    value={formData.apartmentNumber}
                                    onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Apartment or unit number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            Project Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                <input
                                    type="date"
                                    value={formData.preferredDate}
                                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Final scheduling confirmed after quote approval</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                                <select
                                    value={formData.preferredTime}
                                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select time</option>
                                    <option value="morning">Morning (8 AM - 12 PM)</option>
                                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                                    <option value="evening">Evening (4 PM - 8 PM)</option>
                                    <option value="flexible">Flexible</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location on Property *</label>
                                <select
                                    required={true}
                                    value={formData.locationOnProperty}
                                    onChange={(e) => setFormData({ ...formData, locationOnProperty: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select location</option>
                                    {locationOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Approximate Volume</label>
                                <select
                                    value={formData.approximateVolume}
                                    onChange={(e) => setFormData({ ...formData, approximateVolume: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select volume</option>
                                    {volumeOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Access Considerations</label>
                                <textarea
                                    value={formData.accessConsiderations}
                                    onChange={(e) => setFormData({ ...formData, accessConsiderations: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Stairs, elevator, narrow hallways, locked areas, etc."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Photos & Media Upload */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Camera className="w-5 h-5 mr-2" />
                            Photos & Media Upload
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'photos')}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <label htmlFor="photo-upload" className="cursor-pointer">
                                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">Click to upload photos or drag and drop</p>
                                        <p className="text-xs text-gray-500">Multiple images allowed</p>
                                    </label>
                                </div>
                                {formData.photos.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Photos:</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {formData.photos.map((photo, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={URL.createObjectURL(photo)}
                                                        alt={`Photo ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index, 'photos')}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Videos (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        multiple
                                        accept="video/*"
                                        onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'videos')}
                                        className="hidden"
                                        id="video-upload"
                                    />
                                    <label htmlFor="video-upload" className="cursor-pointer">
                                        <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">Click to upload videos or drag and drop</p>
                                        <p className="text-xs text-gray-500">Walk through your pile and explain</p>
                                    </label>
                                </div>
                                {formData.videos.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Videos:</p>
                                        <div className="space-y-2">
                                            {formData.videos.map((video, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Video className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{video.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index, 'videos')}
                                                        className="text-red-500 hover:text-red-600 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Item Type & Condition */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Item Type & Condition
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Material Types</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {materialTypeOptions.map(materialType => (
                                        <label key={materialType} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.materialTypes.includes(materialType)}
                                                onChange={() => handleMaterialTypeToggle(materialType)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{materialType}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Approximate Item Count</label>
                                    <input
                                        type="text"
                                        value={formData.approximateItemCount}
                                        onChange={(e) => setFormData({ ...formData, approximateItemCount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 10-15 items, mixed pile, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.filledWithWater}
                                        onChange={(e) => setFormData({ ...formData, filledWithWater: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Items filled with water</span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.filledWithOil}
                                        onChange={(e) => setFormData({ ...formData, filledWithOil: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Items filled with oil/fuel</span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.hazardousMaterial}
                                        onChange={(e) => setFormData({ ...formData, hazardousMaterial: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Hazardous materials present</span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.itemsInBags}
                                        onChange={(e) => setFormData({ ...formData, itemsInBags: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Items tied in bags</span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.oversizedItems}
                                        onChange={(e) => setFormData({ ...formData, oversizedItems: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Oversized items (hot tubs, pianos, etc.)</span>
                                </div>
                            </div>

                            {formData.hazardousMaterial && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Describe Hazardous Materials</label>
                                    <textarea
                                        value={formData.hazardousDescription}
                                        onChange={(e) => setFormData({ ...formData, hazardousDescription: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Paint, chemicals, asbestos, etc."
                                    />
                                </div>
                            )}

                            {formData.itemsInBags && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">What's in the bags?</label>
                                    <textarea
                                        value={formData.bagContents}
                                        onChange={(e) => setFormData({ ...formData, bagContents: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Describe contents of bags"
                                    />
                                </div>
                            )}

                            {formData.oversizedItems && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Describe Oversized Items</label>
                                    <textarea
                                        value={formData.oversizedDescription}
                                        onChange={(e) => setFormData({ ...formData, oversizedDescription: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Hot tubs, pianos, mattresses, etc."
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Safety & Hazards */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Safety & Hazards
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.hasMold}
                                    onChange={(e) => setFormData({ ...formData, hasMold: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Mold present</span>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.hasPests}
                                    onChange={(e) => setFormData({ ...formData, hasPests: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Pests present</span>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.hasSharpObjects}
                                    onChange={(e) => setFormData({ ...formData, hasSharpObjects: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Sharp objects present</span>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.heavyLiftingRequired}
                                    onChange={(e) => setFormData({ ...formData, heavyLiftingRequired: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Heavy lifting required (100+ lbs)</span>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.disassemblyRequired}
                                    onChange={(e) => setFormData({ ...formData, disassemblyRequired: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Disassembly required</span>
                            </div>
                        </div>

                        {formData.disassemblyRequired && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">What needs disassembly?</label>
                                <textarea
                                    value={formData.disassemblyDescription}
                                    onChange={(e) => setFormData({ ...formData, disassemblyDescription: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Swing set, trampoline, shed, etc."
                                />
                            </div>
                        )}
                    </div>

                    {/* Customer Notes & Additional Services */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Additional Information & Services
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                                <textarea
                                    value={formData.additionalNotes}
                                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Anything else we should know about your project?"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.requestDonationPickup}
                                        onChange={(e) => setFormData({ ...formData, requestDonationPickup: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Request donation pickup for good items</span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.requestDemolition}
                                        onChange={(e) => setFormData({ ...formData, requestDemolition: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Request demolition add-on</span>
                                </div>
                            </div>

                            {formData.requestDemolition && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">What needs demolition?</label>
                                    <textarea
                                        value={formData.demolitionDescription}
                                        onChange={(e) => setFormData({ ...formData, demolitionDescription: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Shed, deck, fence, etc."
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Follow-up & Priority */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Info className="w-5 h-5 mr-2" />
                            Follow-up & Priority
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">How did you hear about us?</label>
                                <select
                                    value={formData.howDidYouHear}
                                    onChange={(e) => setFormData({ ...formData, howDidYouHear: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select option</option>
                                    {howDidYouHearOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Request Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'standard' | 'urgent' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="standard">Standard Request</option>
                                    <option value="urgent">Urgent/Same Day</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Final Confirmation */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                            <div>
                                <h4 className="font-medium text-blue-900">Important Information</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    This is a request for a quote, not an instant booking. We'll review your request and send you a custom quote within 24 hours.
                                    Final scheduling will be confirmed after quote approval.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            required
                            checked={formData.understandPricing}
                            onChange={(e) => setFormData({ ...formData, understandPricing: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            I understand that final pricing will be provided after review of my request *
                        </span>
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
                            Submit Request for Quote
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Add Client Modal Component
interface AddClientModalProps {
    onClose: () => void;
    onSave: (client: Omit<Customer, 'id' | 'created'>) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        status: 'active' as 'active' | 'inactive',
        tags: [] as string[],
        notes: '',
        isCommercial: true,
        portalAccess: false,
        paymentTerms: 'net30' as 'net30' | 'net15' | 'due_on_receipt',
        portalCredentials: {
            username: '',
            email: '',
            password: ''
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                    {/* Business Settings */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Settings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    required
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                                <select
                                    required
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value as 'net30' | 'net15' | 'due_on_receipt' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="net30">Net 30</option>
                                    <option value="net15">Net 15</option>
                                    <option value="due_on_receipt">Due on Receipt</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isCommercial}
                                        onChange={(e) => setFormData({ ...formData, isCommercial: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Commercial Client</span>
                                </label>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.portalAccess}
                                        onChange={(e) => setFormData({ ...formData, portalAccess: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Portal Access</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Portal Credentials */}
                    {formData.portalAccess && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Portal Credentials</h3>
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
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
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
                            Add Client
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Client Modal Component
interface EditClientModalProps {
    client: Customer;
    onClose: () => void;
    onSave: (client: Customer) => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ client, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ...client,
        portalCredentials: client.portalCredentials || { username: '', email: '', password: '' }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Client</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                    {/* Business Settings */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Settings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    required
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                                <select
                                    required
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value as 'net30' | 'net15' | 'due_on_receipt' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="net30">Net 30</option>
                                    <option value="net15">Net 15</option>
                                    <option value="due_on_receipt">Due on Receipt</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.portalAccess}
                                        onChange={(e) => setFormData({ ...formData, portalAccess: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Portal Access</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Portal Credentials */}
                    {formData.portalAccess && (
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
                    )}

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

export default ClientPortal;
