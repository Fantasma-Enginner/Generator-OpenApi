import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule, FormsModule],
})
export class AppComponent {
  title = 'OpenAPI Generator App';

  inputType: 'url' | 'file' = 'url';
  openapiUrl: string = '';
  selectedFile: File | null = null;
  selectedFileName: string = '';
  generatorName: string = 'typescript-angular';
  outputDir: string = './actuator-client';
  downloadFileName: string = 'codigo-generado.zip';
  additionalProperties: string = '';

  generatedCode: string | null = null;
  error: string | null = null;
  isDownloading: boolean = false;
  isGenerating: boolean = false;
  progressPercentage: number = 0;
  progressMessage: string = '';

  private http = inject(HttpClient);

  constructor() {
    // Inicializar las propiedades según el generador por defecto
    this.updatePropertiesForGenerator();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.selectedFileName = this.selectedFile.name;
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }

  onGeneratorChange() {
    this.updatePropertiesForGenerator();
  }

  private updatePropertiesForGenerator() {
    switch (this.generatorName) {
      case 'typescript-angular':
        this.outputDir = './actuator-client';
        this.downloadFileName = 'cliente-angular.zip';
        this.additionalProperties =
          'ngVersion=20.0.0,npmName=@tsir/actuator-api,npmVersion=1.0.0,providedInRoot=true,apiModulePrefix=Tsir,modelSuffix=DTO,withCredentials=true,stringEnums=true';
        break;
      case 'spring':
        this.outputDir = './servidor-spring';
        this.downloadFileName = 'servidor-spring.zip';
        this.additionalProperties =
          'packageName=com.tsir.api,groupId=com.tsir,artifactId=actuator-api,packageVersion=1.0.0,basePackage=com.tsir.api';
        break;
      default:
        this.outputDir = './codigo-generado';
        this.downloadFileName = 'codigo-generado.zip';
        this.additionalProperties = '';
    }
  }

  generateCode() {
    this.generatedCode = null;
    this.error = null;
    this.isGenerating = true;
    this.progressPercentage = 0;
    this.progressMessage = 'Iniciando generación...';

    // Simular progreso
    this.updateProgress();

    if (this.inputType === 'url') {
      this.progressMessage = 'Descargando especificación OpenAPI...';
      // Enviar URL como antes
      this.http
        .post<{ output: string; error?: string }>(
          `${environment.apiUrl}/generate`,
          {
            openapiUrl: this.openapiUrl,
            generatorName: this.generatorName,
            outputDir: this.outputDir,
            additionalProperties: this.additionalProperties,
          }
        )
        .subscribe({
          next: (res) => {
            this.progressPercentage = 100;
            this.progressMessage = 'Código generado exitosamente!';
            this.generatedCode = res.output;
            if (res.error) this.error = res.error;

            // Resetear estado después de un breve delay
            setTimeout(() => {
              this.isGenerating = false;
              this.progressPercentage = 0;
              this.progressMessage = '';
            }, 1500);
          },
          error: (err) => {
            this.error = err.error?.error || 'Error al generar el código';
            this.isGenerating = false;
            this.progressPercentage = 0;
            this.progressMessage = '';
          },
        });
    } else if (this.inputType === 'file' && this.selectedFile) {
      this.progressMessage = 'Subiendo archivo y generando código...';
      // Enviar archivo usando FormData
      const formData = new FormData();
      formData.append('openapiFile', this.selectedFile);
      formData.append('generatorName', this.generatorName);
      formData.append('outputDir', this.outputDir);
      formData.append('additionalProperties', this.additionalProperties);

      this.http
        .post<{ output: string; error?: string }>(
          `${environment.apiUrl}/generate-from-file`,
          formData
        )
        .subscribe({
          next: (res) => {
            this.progressPercentage = 100;
            this.progressMessage = 'Código generado exitosamente!';
            this.generatedCode = res.output;
            if (res.error) this.error = res.error;

            // Resetear estado después de un breve delay
            setTimeout(() => {
              this.isGenerating = false;
              this.progressPercentage = 0;
              this.progressMessage = '';
            }, 1500);
          },
          error: (err) => {
            this.error =
              err.error?.error || 'Error al generar el código desde archivo';
            this.isGenerating = false;
            this.progressPercentage = 0;
            this.progressMessage = '';
          },
        });
    } else {
      this.error = 'Por favor selecciona una URL o un archivo válido.';
    }
  }

  downloadGeneratedFiles() {
    if (!this.generatedCode) {
      this.error = 'No hay archivos generados para descargar.';
      return;
    }

    this.isDownloading = true;
    this.error = null;

    // Determinar el nombre del archivo
    const fileName = this.downloadFileName || 'codigo-generado.zip';

    // Llamar al endpoint de descarga
    this.http
      .post(
        `${environment.apiUrl}/download`,
        {
          outputDir: this.outputDir,
          fileName: fileName,
        },
        {
          responseType: 'blob',
          observe: 'response',
        }
      )
      .subscribe({
        next: (response) => {
          const blob = response.body;
          if (blob) {
            // Crear URL temporal para el blob
            const url = window.URL.createObjectURL(blob);

            // Crear elemento de descarga temporal
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;

            // Simular click para iniciar descarga
            document.body.appendChild(link);
            link.click();

            // Limpiar
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }
          this.isDownloading = false;
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al descargar los archivos';
          this.isDownloading = false;
        },
      });
  }

  private updateProgress() {
    // Simular progreso de generación
    const interval = setInterval(() => {
      if (this.progressPercentage < 80) {
        this.progressPercentage += Math.random() * 10;

        if (this.progressPercentage >= 20 && this.progressPercentage < 40) {
          this.progressMessage = 'Analizando especificación OpenAPI...';
        } else if (
          this.progressPercentage >= 40 &&
          this.progressPercentage < 60
        ) {
          this.progressMessage = 'Generando archivos de código...';
        } else if (
          this.progressPercentage >= 60 &&
          this.progressPercentage < 80
        ) {
          this.progressMessage = 'Finalizando generación...';
        }
      } else {
        clearInterval(interval);
      }
    }, 200);
  }
}
