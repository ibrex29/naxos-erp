export function extractNames(fullName: string) {
  const namesArray = fullName.trim().split(/\s+/);

  const firstName = namesArray[0];

  const lastName = namesArray[namesArray.length - 1];

  let middleName = '';
  if (namesArray.length > 2) {
    
    middleName = namesArray.slice(1, namesArray.length - 1).join(' ');
  }

  // Return an object containing the extracted names
  return {
    firstName: firstName,
    lastName: lastName,
    middleName: middleName,
  };
}
 