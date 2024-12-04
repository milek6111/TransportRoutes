import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatCardModule} from '@angular/material/card'
import {MatFormFieldModule} from '@angular/material/form-field'
import { MatInput } from '@angular/material/input';
import { Neo4jService } from '../../services/neo4j.service';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-add-city',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInput, ReactiveFormsModule, CommonModule, MatButton],
  templateUrl: './add-city.component.html',
  styleUrl: './add-city.component.css'
})
export class AddCityComponent {
  cityForm: FormGroup;

  constructor(private fb: FormBuilder, private neo4jService: Neo4jService) {
    this.cityForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  addCity(): void {
    if (this.cityForm.valid) {
      const cityData = {
        nazwa: this.cityForm.value.name
      };
  
      this.neo4jService
        .addCity(cityData)
        .then(() => {
          alert('Miasto zostało dodane.');
          this.cityForm.reset();
        })
        .catch((error) => {
          console.error('Błąd:', error);
          alert('Wystąpił błąd podczas dodawania miasta.');
        });
    } else {
      alert('Proszę wprowadzić poprawne dane miasta.');
    }
  }
  

  
}
