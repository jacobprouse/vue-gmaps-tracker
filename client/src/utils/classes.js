export class Location {
  constructor (object) {
    if (typeof object.name !== 'string') throw('Name must be a string.')
    if (typeof object.lat !== 'number') throw('Latitude must be a number.')
    if (typeof object.lng !== 'number') throw('Longitude must be a number.')
    if (typeof object.level !== 'number') throw('Number must be a number.')
    if (typeof object.threshold !== 'number') throw('Number must be a number.')
    this.name = name
    if (object.lat < -90 || object.lat > 90) throw('Latitude must be -90 <-> +90.')
    if (object.lng < -180 || object.lng > 180) throw('Longitude must be -180 <-> +180.')
    this.lat = object.lat
    this.lng = object.lng
    // If the level is negative set it to 0.
    this.level = object.level < 0 ? 0 : object.level
    // If the threshold is negative, set to 50.
    // If the threshold is greater than 100, set to 100.
    if (object.threshold > 100) this.threshold = 100
    if (object.threshold  < 0) this.threshold = 50
  }
}