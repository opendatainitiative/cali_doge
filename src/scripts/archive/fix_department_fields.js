#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the departments and hierarchy files
const departmentsPath = path.join(__dirname, '../data/departments.json');
const hierarchyPath = path.join(__dirname, '../data/executive-branch-hierarchy.json');

const departmentsData = JSON.parse(fs.readFileSync(departmentsPath, 'utf8'));
const hierarchy = JSON.parse(fs.readFileSync(hierarchyPath, 'utf8'));

// Define Constitutional Officers and their departments with proper names and aliases
const constitutionalOfficers = {
  name: "Constitutional Officers",
  orgLevel: 2,
  aliases: ["Constitutional Office", "Constitutional Officers of California"],
  subAgencies: [
    {
      name: "Office of the Lieutenant Governor",
      orgLevel: 3,
      budget_status: "active",
      aliases: ["Lieutenant Governor", "Office of Lieutenant Governor", "Lieutenant Governor's Office"]
    },
    {
      name: "Secretary of State",
      orgLevel: 3,
      budget_status: "active",
      aliases: ["California Secretary of State", "Secretary of State's Office"]
    },
    {
      name: "State Controller",
      orgLevel: 3,
      budget_status: "active",
      aliases: ["State Controller's Office", "California State Controller"]
    },
    {
      name: "State Treasurer",
      orgLevel: 3,
      budget_status: "active",
      aliases: ["State Treasurer's Office", "California State Treasurer"]
    },
    {
      name: "Department of Justice",
      orgLevel: 3,
      budget_status: "active",
      aliases: ["Attorney General", "Office of the Attorney General", "California Department of Justice"]
    },
    {
      name: "Department of Insurance",
      orgLevel: 3,
      budget_status: "active",
      aliases: ["Insurance Commissioner", "California Department of Insurance", "Office of the Insurance Commissioner"]
    },
    {
      name: "Department of Education",
      orgLevel: 3,
      budget_status: "active",
      aliases: ["Superintendent of Public Instruction", "California Department of Education", "State Department of Education"]
    }
  ]
};

// Define agency structure for missing departments with standardized names and aliases
const agencyStructure = {
  "Natural Resources Agency": {
    orgLevel: 3,
    aliases: ["California Natural Resources Agency"],
    subAgencies: [
      {
        name: "Department of Water Resources",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["California Department of Water Resources", "DWR"]
      },
      {
        name: "Department of Conservation",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["California Department of Conservation", "DOC"]
      },
      {
        name: "Department of Parks and Recreation",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["California Department of Parks and Recreation", "State Parks"]
      }
    ]
  },
  "California Environmental Protection Agency": {
    orgLevel: 3,
    aliases: ["CalEPA", "Environmental Protection Agency"],
    subAgencies: [
      {
        name: "Water Resources Control Board",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["State Water Resources Control Board", "SWRCB"]
      },
      {
        name: "Department of Toxic Substances Control",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["California Department of Toxic Substances Control", "DTSC"]
      }
    ]
  },
  "Health and Human Services Agency": {
    orgLevel: 3,
    aliases: ["California Health and Human Services Agency", "CHHS"],
    subAgencies: [
      {
        name: "California Department of Social Services",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["Department of Social Services", "CDSS"]
      },
      {
        name: "California Department of State Hospitals",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["Department of State Hospitals", "DSH"]
      },
      {
        name: "California Department of Developmental Services",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["Department of Developmental Services", "DDS"]
      }
    ]
  },
  "Agriculture Agency": {
    orgLevel: 3,
    aliases: ["California Agriculture Agency"],
    subAgencies: [
      {
        name: "California Department of Food and Agriculture",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["Department of Food and Agriculture", "CDFA"]
      }
    ]
  },
  "Veterans Affairs Agency": {
    orgLevel: 3,
    aliases: ["California Veterans Affairs Agency", "CalVet Agency"],
    subAgencies: [
      {
        name: "California Department of Veterans Affairs",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["Department of Veterans Affairs", "CalVet"]
      }
    ]
  },
  "Business, Consumer Services, and Housing Agency": {
    orgLevel: 3,
    aliases: ["BCSH Agency", "Business and Consumer Services Agency"],
    subAgencies: [
      {
        name: "Horse Racing Board",
        orgLevel: 4,
        budget_status: "active",
        aliases: ["California Horse Racing Board", "CHRB"]
      }
    ]
  }
};

// Define Secretaries with standardized names and aliases
const secretaries = [
  {
    name: "Secretary of Health and Human Services",
    orgLevel: 3,
    parentAgency: "Constitutional Officers",
    budget_status: "active",
    aliases: ["Health and Human Services Secretary", "CHHS Secretary"]
  },
  {
    name: "Secretary for Labor and Workforce Development",
    orgLevel: 3,
    parentAgency: "Constitutional Officers",
    budget_status: "active",
    aliases: ["Labor Secretary", "Workforce Development Secretary"]
  },
  {
    name: "Secretary for Government Operations",
    orgLevel: 3,
    parentAgency: "Constitutional Officers",
    budget_status: "active",
    aliases: ["GovOps Secretary", "Government Operations Secretary"]
  },
  {
    name: "Secretary of Business, Consumer Services and Housing",
    orgLevel: 3,
    parentAgency: "Constitutional Officers",
    budget_status: "active",
    aliases: ["BCSH Secretary", "Business and Consumer Services Secretary"]
  },
  {
    name: "Secretary of Transportation",
    orgLevel: 3,
    parentAgency: "Constitutional Officers",
    budget_status: "active",
    aliases: ["Transportation Secretary", "CalSTA Secretary"]
  }
];

// Add Secretaries to Constitutional Officers
constitutionalOfficers.subAgencies = [...constitutionalOfficers.subAgencies, ...secretaries];

// Add Constitutional Officers to hierarchy under Executive Branch
if (!hierarchy.subAgencies) {
  hierarchy.subAgencies = [];
}

// Add Constitutional Officers
hierarchy.subAgencies.push(constitutionalOfficers);

// Add agency structure to hierarchy
Object.entries(agencyStructure).forEach(([agencyName, agency]) => {
  // Find or create the agency in hierarchy
  let existingAgency = hierarchy.subAgencies.find(a => a.name === agencyName);
  if (!existingAgency) {
    existingAgency = {
      name: agencyName,
      orgLevel: agency.orgLevel,
      aliases: agency.aliases,
      subAgencies: []
    };
    hierarchy.subAgencies.push(existingAgency);
  }
  
  // Add subAgencies with their aliases
  existingAgency.subAgencies = [
    ...(existingAgency.subAgencies || []),
    ...agency.subAgencies
  ];
});

// Helper function to normalize a string for comparison
function normalizeString(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Helper function to check if names match (including aliases)
function namesMatch(name1, entity) {
  const norm1 = normalizeString(name1);
  const norm2 = normalizeString(entity.name);
  
  if (norm1 === norm2) return true;
  
  if (entity.aliases) {
    return entity.aliases.some(alias => normalizeString(alias) === norm1);
  }
  
  return false;
}

// Update department records with correct orgLevels, parent_agency, and aliases
departmentsData.departments.forEach(dept => {
  // Update Constitutional Officers and their departments
  const constitutionalOfficer = constitutionalOfficers.subAgencies.find(
    agency => namesMatch(dept.name, agency)
  );
  if (constitutionalOfficer) {
    dept.orgLevel = constitutionalOfficer.orgLevel;
    dept.parent_agency = ["Constitutional Officers"];
    dept.aliases = constitutionalOfficer.aliases || [];
  }

  // Update departments under agencies
  Object.entries(agencyStructure).forEach(([agencyName, agency]) => {
    const subAgency = agency.subAgencies.find(sa => namesMatch(dept.name, sa));
    if (subAgency) {
      dept.orgLevel = subAgency.orgLevel;
      dept.parent_agency = [agencyName];
      dept.aliases = subAgency.aliases || [];
    }
  });
});

// Write updated files back
fs.writeFileSync(hierarchyPath, JSON.stringify(hierarchy, null, 2));
fs.writeFileSync(departmentsPath, JSON.stringify(departmentsData, null, 2));

console.log("✅ Updated hierarchy and department records with standardized names and comprehensive aliases"); 